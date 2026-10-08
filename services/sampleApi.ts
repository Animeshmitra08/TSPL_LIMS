const API_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export type SampleLabParameter = { maintaiN_TYPE: string; zparameter: string };
export type SampleLabInboundEntry = { maintaiN_TYPE: string; samplE_ID: string };
export type SampleLabMachine = { machinE_NAME: string };
export type SampleLabCompleteParameter = {
  slno: string;
  samplE_ID: string;
  maintaiN_TYPE: string;
  zparameter: string;
  zcount: string;
  comP_FLAG: string;
};

// tRakeNo rows are the same shape as the PTYPE submit payload below (every
// field, including w1-w4) — confirmed against a real SAMPLE_ID response.
// This is the only part of the SampleLab response that actually carries
// previously-submitted weight values; tCompleteParameters only has
// completion status (comP_FLAG/zcount), not the weights themselves.
export type SampleLabRakeEntry = SampleLabPTypePayload;

export type SampleLabResponse = {
  oP_TYPE: string;
  zdate: string;
  samplE_ID: string;
  tCompleteParameters: SampleLabCompleteParameter[];
  tRakeNo: SampleLabRakeEntry[];
  tInboundList: SampleLabInboundEntry[];
  tParameters: SampleLabParameter[];
  tMachineList: SampleLabMachine[];
  messages: { type: string; message: string }[];
};

async function fetchSampleLab(query: { zDate: string } | { sampleId: string }): Promise<SampleLabResponse> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_BASE_URL is not configured (see .env)");
  }

  // Built by hand rather than via URLSearchParams — not reliably polyfilled
  // across React Native/Hermes versions.
  const queryString =
    "zDate" in query ? `ZDate=${encodeURIComponent(query.zDate)}` : `SAMPLE_ID=${encodeURIComponent(query.sampleId)}`;

  const response = await fetch(`${API_BASE_URL}/SampleLab/SampleLab?${queryString}`);
  console.log(response);

  if (!response.ok) {
    throw new Error(`SampleLab request failed (${response.status})`);
  }
  return response.json();
}

// tMachineList is present in every SampleLab response regardless of query
// validity (confirmed against a bare no-param call, which otherwise just
// comes back as a "Please Pass Proper input" error) — so the Balance picker
// doesn't have to wait for a date/QR query before showing live machines.
export async function fetchMachineOptions(): Promise<string[]> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_BASE_URL is not configured (see .env)");
  }
  const response = await fetch(`${API_BASE_URL}/SampleLab/SampleLab`);
  if (!response.ok) {
    throw new Error(`SampleLab request failed (${response.status})`);
  }
  const data: SampleLabResponse = await response.json();
  return extractMachineOptions(data);
}

export function fetchSampleLabByDate(zDate: string): Promise<SampleLabResponse> {
  return fetchSampleLab({ zDate });
}

export function fetchSampleLabBySampleId(sampleId: string): Promise<SampleLabResponse> {
  return fetchSampleLab({ sampleId });
}

// Sample IDs scoped to one Type AND Parameter — union of two sources:
// tCompleteParameters rows already tracked under this exact Type+Parameter
// (zcount/comP_FLAG show prior progress on it), PLUS tInboundList rows for
// this Type that haven't had ANY parameter recorded yet at all — tInboundList
// doesn't carry zparameter, so those can only be matched on Type, but they
// still belong in the list: a freshly inbound sample with zero weight
// recorded so far is exactly the case that needs to show up here so it can
// be weighed for the first time, not just samples already in progress.
// Empty until both Type and Parameter are picked — mirrors
// extractParameterOptions, which is empty until Type alone is picked.
export function extractSampleIdsForTypeAndParameter(data: SampleLabResponse, type: string, parameter: string): string[] {
  if (!type || !parameter) return [];
  const ids = [
    ...data.tCompleteParameters
      .filter((entry) => entry.maintaiN_TYPE === type && entry.zparameter === parameter)
      .map((entry) => entry.samplE_ID),
    ...data.tInboundList.filter((entry) => entry.maintaiN_TYPE === type).map((entry) => entry.samplE_ID),
  ].filter(Boolean);
  return Array.from(new Set(ids));
}

// Type/Parameter defaults for one specific Sample ID — the first of that
// sample's own tCompleteParameters rows that hasn't been completed yet
// (comP_FLAG !== "X"), the next thing the operator needs to weigh for it.
// Falls back to its first row if every one of its rows is already flagged
// complete, or {"", ""} if the sample has no rows at all (e.g. Sample ID
// was cleared). Used only by the QR-scan flow, which identifies a sample
// before any Type has been picked, so it has to resolve Type too.
export function extractDefaultsForSample(data: SampleLabResponse, sampleId: string): { type: string; parameter: string } {
  const rows = data.tCompleteParameters.filter((row) => row.samplE_ID === sampleId);
  const row = rows.find((entry) => entry.comP_FLAG !== "X") ?? rows[0];
  return { type: row?.maintaiN_TYPE ?? "", parameter: row?.zparameter ?? "" };
}

// Parameter default for one specific Sample ID + Type pair — used once Type
// is already known (manual Type-then-Sample-ID selection, or a screen with
// a fixed Type), unlike extractDefaultsForSample above which also has to
// resolve Type itself. Same "first incomplete row, else first row, else
// none" precedence.
export function extractParameterForSampleAndType(data: SampleLabResponse, sampleId: string, type: string): string {
  const rows = data.tCompleteParameters.filter((row) => row.samplE_ID === sampleId && row.maintaiN_TYPE === type);
  const row = rows.find((entry) => entry.comP_FLAG !== "X") ?? rows[0];
  return row?.zparameter ?? "";
}

// Weight Balance restricts B_INSTANT's Parameter list to just these two
// (Moisture Balance handles B_INSTANT's other parameters instead, and
// explicitly excludes anything VM-prefixed from its own Parameter list).
export const VM_PARAMETERS = ["VM1", "VM2"];

// The previously-submitted weight record for one exact Sample ID + Type +
// Parameter, pulled from tRakeNo — null if there's no matching row, or the
// matching row has never actually been submitted. "00000000" is the
// backend's placeholder erdat for a not-yet-recorded row (default w1-w4 of
// 0 with no ernam/erdat/erzet), which is different from a real submission
// that happens to have some of w1-w4 still genuinely at 0 (e.g. only W1/W2
// weighed so far) — only the latter should be shown as a recorded reading.
export function extractRecordedWeights(
  data: SampleLabResponse,
  sampleId: string,
  type: string,
  parameter: string
): SampleLabRakeEntry | null {
  const row = data.tRakeNo.find(
    (entry) => entry.samplE_ID === sampleId && entry.maintaiN_TYPE === type && entry.zparameter === parameter
  );
  if (!row || row.erdat === "00000000") return null;
  return row;
}

// Inverse of formatZDate/formatZTime — turns a stored "YYYYMMDD"/"HHMMSS"
// pair back into a readable timestamp, for labeling a weight pulled from
// extractRecordedWeights (as opposed to a fresh live "Get Weight" capture,
// which already has its own human-readable time from the mq feed).
export function formatZTimestamp(erdat: string, erzet: string): string {
  const datePart = `${erdat.slice(0, 4)}-${erdat.slice(4, 6)}-${erdat.slice(6, 8)}`;
  const timePart = `${erzet.slice(0, 2)}:${erzet.slice(2, 4)}:${erzet.slice(4, 6)}`;
  return `${datePart} ${timePart}`;
}

// Balance/machine options for the live-feed picker ("Get Weight"/"Get
// Result") — dynamic from tMachineList instead of a hardcoded ["220 g",
// "4000 g"] list, so new machines show up without an app change. Present in
// every SampleLab response regardless of query validity (confirmed against
// both a real ZDate query and a bare error-path response), same as
// tParameters below.
export function extractMachineOptions(data: SampleLabResponse): string[] {
  const names = data.tMachineList.map((m) => m.machinE_NAME).filter(Boolean);
  return Array.from(new Set(names));
}

// tParameters is the reference list of maintenance types the API actually
// supports — replaces the previously hardcoded ["Ash", "Coal"] Type options
// with whatever maintaiN_TYPE values it carries (e.g. COAL, COAL_FEEDING,
// B_COMPOSITE, B_INSTANT), deduplicated.
export function extractTypeOptions(data: SampleLabResponse): string[] {
  const types = data.tParameters.map((param) => param.maintaiN_TYPE).filter(Boolean);
  return Array.from(new Set(types));
}

// Parameter options are scoped to the currently selected Type — tParameters
// carries maintaiN_TYPE/zparameter pairs, so e.g. selecting COAL surfaces
// only COAL's own parameters (ASH1, IM1, VM1, GCV1, ...), not every
// parameter across every type in the day's data. Empty until a Type is
// picked.
export function extractParameterOptions(data: SampleLabResponse, type: string): string[] {
  if (!type) return [];
  const params = data.tParameters.filter((param) => param.maintaiN_TYPE === type).map((param) => param.zparameter).filter(Boolean);
  return Array.from(new Set(params));
}

// ZDate query param format, e.g. 2026-07-18 -> "20260718".
export function formatZDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

// erzet time format matching samP_TM/erzet in the API, e.g. 15:27:47 -> "152747".
export function formatZTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}${minutes}${seconds}`;
}

export type SampleLabPTypePayload = {
  slnO_INBOUND: number;
  inbounD_NO: string;
  slno: number;
  maintaiN_TYPE: string;
  zparameter: string;
  samplE_ID: string;
  disH_NUMBER: string;
  w1: number;
  w2: number;
  w3: number;
  w4: number;
  gcV1: number;
  gcV2: number;
  sulphur: number;
  sodiuM_CARBONATE: number;
  fusE_LENGTH: number;
  samP_DT: string;
  samP_TM: string;
  zresult: number;
  comP_FLAG: string;
  ernam: string;
  erdat: string;
  erzet: string;
};

export async function submitSampleLabWeights(payload: SampleLabPTypePayload): Promise<void> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_BASE_URL is not configured (see .env)");
  }

  const response = await fetch(`${API_BASE_URL}/SampleLab/PTYPE`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Submit failed (${response.status})`);
  }
}
