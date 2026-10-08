import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { DatePickerModal } from "@/components/date-picker-modal";
import { QrScannerModal } from "@/components/qr-scanner-modal";
import { RadioGroup } from "@/components/radio-group";
import { SearchableSelect } from "@/components/searchable-select";
import { SubmissionResultModal, type SubmissionResult } from "@/components/submission-result-modal";
import { colors } from "@/constants/weightBalanceColors";
import {
  extractDefaultsForSample,
  extractMachineOptions,
  extractParameterOptions,
  extractRecordedWeights,
  extractSampleIdsForTypeAndParameter,
  extractTypeOptions,
  fetchMachineOptions,
  fetchSampleLabByDate,
  fetchSampleLabBySampleId,
  formatZDate,
  formatZTime,
  formatZTimestamp,
  submitSampleLabWeights,
  VM_PARAMETERS,
  type SampleLabResponse,
} from "@/services/sampleApi";
import { useMqSocket } from "@/services/mqSocket";

const WEIGHT_SLOTS = ["W1", "W2", "W3", "W4"];
// Operator/machine code recorded against every submission — this device has
// no login flow, so it's a fixed value rather than something the user enters.
const ERNAM = "TD-PMPL-039";

const STATUS_LABEL = { connecting: "Connecting…", open: "Connected", closed: "Disconnected — retrying" };
const STATUS_COLOR = { connecting: colors.warning, open: colors.success, closed: colors.danger };

type WeightReading = { key: string; value: string | null; unit: string | null; time: string | null };

function formatDisplayDate(date: Date | null): string {
  if (!date) return "Select date";
  return date.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

// Live-feed source names and tMachineList's machinE_NAME values represent
// the same machine with different separators — e.g. the live feed may send
// "FR MA 01" (spaces) while tMachineList calls it "FR_MA_01" (underscores).
// Stripping every non-alphanumeric character (not just whitespace) before
// comparing means either side's separator style, or case, never prevents a
// match.
function normalizeBalanceLabel(label: string): string {
  return label.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

// Exact match first, then a bidirectional "contains" check as a fallback —
// a live source sometimes carries extra decoration around the core machine
// name (e.g. a prefix/suffix tacked on by whatever's publishing it), so
// requiring an exact match alone would miss those. The empty-string guard
// matters here: without it, an unset/blank source or balance would
// "contain" (match) everything via the empty-string .includes() case.
function sourceMatchesBalance(data: Record<string, unknown>, balance: string): boolean {
  const source = normalizeBalanceLabel(String(data.source ?? data.WB_Name ?? ""));
  const machine = normalizeBalanceLabel(balance);
  if (!source || !machine) return false;
  return source === machine || source.includes(machine) || machine.includes(source);
}

// tMachineList carries both Weighing Scale ("WS", e.g. "PKG_WS_01") and
// Moisturizer Analyzer ("MA", e.g. "FR_MA_01") machines together — the
// category code before/after it (FR/BCM/PKG) is just a shared location/zone
// tag, not what decides the screen, and its position isn't consistent
// either way, so this just checks for "WS" anywhere in the name rather than
// hardcoding Weight Balance's own machine names.
function isWeightBalanceMachine(machineName: string): boolean {
  return machineName.toUpperCase().includes("WS");
}

// Machine names are stored/transmitted with underscores (e.g. "PKG_WS_01")
// but read better on screen as "PKG WS 01" — display-only, the raw
// underscored value is still what's used for matching and shown in the
// post-submit summary.
function formatMachineLabel(machineName: string): string {
  return machineName.replace(/_/g, " ");
}

const LIVE_FEED_STATUS_LABEL = { connecting: "connecting...", open: "connected", closed: "disconnected — retrying..." };

// Some Type+Parameter combos don't take a full W1-W4 weighing sequence —
// COAL's VM1/VM2 skip W3, B_INSTANT's VM1/VM2 skip W4, and B_COMPOSITE's
// FINES1/FINES2 skip W4. Those slots are disabled in the UI and forced to 0
// on submit so a stale or accidental reading never gets sent for them.
function disabledWeightSlotsFor(type: string, parameter: string): string[] {
  const isVM = parameter.startsWith("VM");
  const isFines = parameter === "FINES1" || parameter === "FINES2";
  if (type === "COAL" && isVM) return ["W3"];
  if (type === "B_INSTANT" && isVM) return ["W4"];
  if (type === "B_COMPOSITE" && isFines) return ["W4"];
  return [];
}

// Columns shown for the live feed: Time, Source, Metric, Value, Unit.
function liveFeedRow(message: { timestamp: string; data: Record<string, unknown> }) {
  const time = message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : "";
  const data = message.data;
  const source = data.source ?? data.WB_Name;
  const metric = data.metricName;
  const value = data.value ?? data.CurrentWeight;
  const unit = data.unit;
  return {
    time,
    source: source !== undefined && source !== null ? String(source) : "",
    metric: metric !== undefined && metric !== null ? String(metric) : "",
    value: value !== undefined && value !== null ? String(value) : "",
    unit: unit !== undefined && unit !== null ? String(unit) : "",
  };
}

export default function SampleWeighingScreen() {
  const [sampleId, setSampleId] = useState("");
  const [type, setType] = useState("");
  // Dynamic from tMachineList (e.g. "220G_2", "4000G_1") rather than a
  // hardcoded ["220 g", "4000 g"] list, so new machines show up without an
  // app change. Empty until the first date-select/QR-scan response arrives.
  const [balance, setBalance] = useState("");
  const [balanceOptions, setBalanceOptions] = useState<string[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [weights, setWeights] = useState<WeightReading[]>(
    WEIGHT_SLOTS.map((key) => ({ key, value: null, unit: null, time: null }))
  );
  const { messages, status } = useMqSocket();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [typeOptions, setTypeOptions] = useState<string[]>([]);
  const [sampleLabData, setSampleLabData] = useState<SampleLabResponse | null>(null);
  const [parameter, setParameter] = useState("");
  const [dishNumber, setDishNumber] = useState("");
  const [isLoadingSampleLab, setIsLoadingSampleLab] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  // Shared by the disconnect handler below and by a successful submit —
  // wipes the in-progress weighing session (captured weights and the
  // Sample ID/Type/Parameter/Dish Number selections) back to a blank form.
  const resetForm = () => {
    setWeights(WEIGHT_SLOTS.map((key) => ({ key, value: null, unit: null, time: null })));
    setSelectedDate(null);
    setSampleId("");
    setType("");
    setParameter("");
    setDishNumber("");
  };

  // After a successful submit, the operator is very likely about to weigh
  // another sample for the same Date/Type (e.g. working through today's
  // COAL samples one at a time) — only the sample-specific fields get
  // cleared, so Date/Type don't have to be re-picked for every single
  // sample. resetForm (above) is still used for the connection-lost case,
  // where everything including Date/Type is cleared.
  const resetAfterSubmit = () => {
    setWeights(WEIGHT_SLOTS.map((key) => ({ key, value: null, unit: null, time: null })));
    setSampleId("");
    setParameter("");
    setDishNumber("");
  };

  // The live balance feed is what "Get Weight" reads from — once an
  // established connection drops, any weights already captured (and the
  // sample being worked on) can't be trusted to still be current, so the
  // form is cleared rather than left showing stale data. This only fires on
  // an actual open->closed transition — NOT on every failed retry while the
  // socket was never open in the first place (useMqSocket's status cycles
  // closed->connecting->closed every ~3s during those retries, and without
  // this guard the effect would re-fire — and re-alert — on every single
  // cycle, which is indistinguishable from the app being broken).
  // useMqSocket already retries the connection on its own for as long as
  // this screen is mounted; this only reacts to that status, it doesn't
  // drive the reconnect itself.
  const previousMqStatusRef = useRef(status);
  useEffect(() => {
    if (status === "closed" && previousMqStatusRef.current === "open") {
      resetForm();
      Alert.alert("Connection lost", "The live balance connection was lost, so the form was cleared. Reconnecting…");
    }
    previousMqStatusRef.current = status;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Balance options don't need a date picked first — tMachineList comes
  // back on every SampleLab call regardless of query validity, so this
  // loads it once up front on mount instead of waiting on
  // handleSelectDate/handleScanned. Those still refresh it too (via
  // applySampleLabResult), so this is just about not leaving the Balance
  // picker empty before the operator has done anything. Silent on failure —
  // this is a background convenience fetch, not something worth an alert
  // for; handleSelectDate/handleScanned will surface a real error later if
  // the API is actually unreachable.
  useEffect(() => {
    let cancelled = false;
    fetchMachineOptions()
      .then((allMachines) => {
        if (cancelled) return;
        const machines = allMachines.filter(isWeightBalanceMachine);
        setBalanceOptions(machines);
        setBalance((prev) => (machines.includes(prev) ? prev : machines[0] ?? ""));
      })
      .catch((err) => console.log("Initial machine list fetch failed:", err));
    return () => {
      cancelled = true;
    };
  }, []);

  // Parameter options are scoped to the currently selected Type, so this
  // recomputes whenever Type or the last-fetched SampleLab response changes
  // — no separate fetch needed. B_INSTANT is further restricted to just
  // VM1/VM2 on this screen — tParameters may carry other B_INSTANT
  // parameters too, but only VM1/VM2 are meant to be weighed here (Moisture
  // Balance is where B_INSTANT's other parameters belong).
  const parameterOptions = sampleLabData
    ? extractParameterOptions(sampleLabData, type).filter((p) => (type === "B_INSTANT" ? (VM_PARAMETERS as string[]).includes(p) : true))
    : [];

  // Sample ID options are scoped to BOTH the currently selected Type AND
  // Parameter — empty until both are picked.
  const sampleIdOptions = sampleLabData ? extractSampleIdsForTypeAndParameter(sampleLabData, type, parameter) : [];

  // Type changed — its old Parameter selection may not belong to the new
  // Type's parameter set, so clear it rather than leave a stale value. The
  // Sample ID list is scoped to Type (and Parameter) too, so a previously
  // picked Sample ID may no longer even be in it — clear that as well
  // rather than leave a now-invalid selection sitting in the field. Weights
  // are cleared too: they're only ever populated for a specific Sample ID
  // (live capture or a prior recorded reading), so once that Sample ID is
  // cleared, leaving old values in the W1-W4 boxes would misrepresent them
  // as belonging to whatever gets picked next.
  const handleTypeChange = (value: string) => {
    setType(value);
    setParameter("");
    setSampleId("");
    setWeights(WEIGHT_SLOTS.map((key) => ({ key, value: null, unit: null, time: null })));
    setDishNumber("");
  };

  // Parameter changed — Sample ID is scoped to Type AND Parameter, so a
  // previously picked Sample ID may no longer belong to the new Parameter's
  // set. Clear it (and the weights that went with it) rather than leave a
  // stale value.
  const handleParameterChange = (value: string) => {
    setParameter(value);
    setSampleId("");
    setWeights(WEIGHT_SLOTS.map((key) => ({ key, value: null, unit: null, time: null })));
    setDishNumber("");
  };

  // Pre-fills W1-W4 (and the Dish Number, if that prior submission recorded
  // one) from a prior submission for this exact Sample ID + Type +
  // Parameter (pulled from tRakeNo, via extractRecordedWeights), rather
  // than leaving the fields blank — the operator sees what's already been
  // recorded instead of always starting from "No reading yet". Resets to
  // blank when there's no prior record (or no Sample ID at all), so
  // switching samples doesn't leave a stale set of values from whichever
  // one was selected before it.
  const applyRecordedWeights = (data: SampleLabResponse | null, id: string, currentType: string, currentParameter: string) => {
    const recorded =
      data && id && currentType && currentParameter ? extractRecordedWeights(data, id, currentType, currentParameter) : null;
    setWeights(
      WEIGHT_SLOTS.map((key) => {
        if (!recorded) return { key, value: null, unit: null, time: null };
        const field = key.toLowerCase() as "w1" | "w2" | "w3" | "w4";
        return { key, value: String(recorded[field]), unit: null, time: formatZTimestamp(recorded.erdat, recorded.erzet) };
      })
    );
    setDishNumber(recorded?.disH_NUMBER ?? "");
  };

  // Sample ID changed — Type and Parameter are already selected (that's
  // what scoped the Sample ID list this came from), so the only thing left
  // to do is pull up any weights already recorded for this exact combo.
  const handleSampleIdChange = (value: string) => {
    setSampleId(value);
    applyRecordedWeights(sampleLabData, value, type, parameter);
  };

  const disabledWeightSlots = disabledWeightSlotsFor(type, parameter);

  // The row for the exact Sample ID + Type + Parameter combo currently
  // selected — comP_FLAG "X" on it means this measurement was already
  // completed upstream, so weighing it again and submitting isn't valid.
  const selectedParameterRow = sampleLabData?.tCompleteParameters.find(
    (row) => row.samplE_ID === sampleId && row.maintaiN_TYPE === type && row.zparameter === parameter
  );
  const isParameterCompleted = selectedParameterRow?.comP_FLAG === "X";

  // Sample ID, Type, and Parameter are all required before Submit is usable.
  const isMissingRequiredField = !sampleId || !type || !parameter;
  const isSubmitDisabled = isSubmitting || isParameterCompleted || isMissingRequiredField;

  // Both the date query and the QR scan hit the same SampleLab endpoint and
  // get back the same shape — this is what both flows do with the result:
  // the Type dropdown comes from tParameters (replaces the previously
  // hardcoded ["Ash", "Coal"] options), the Balance picker comes from
  // tMachineList (replaces the previously hardcoded ["220 g", "4000 g"]),
  // and the raw response is kept around so the Parameter and Sample ID
  // dropdowns can both be recomputed as Type changes. The current Balance
  // selection is preserved across reloads as long as that machine is still
  // in the new list; otherwise it falls back to the first machine.
  const applySampleLabResult = (data: SampleLabResponse) => {
    setTypeOptions(extractTypeOptions(data));
    setSampleLabData(data);
    const machines = extractMachineOptions(data).filter(isWeightBalanceMachine);
    setBalanceOptions(machines);
    setBalance((prev) => (machines.includes(prev) ? prev : machines[0] ?? ""));
  };

  // Date-select loads the day's samples into the dropdown but does NOT
  // auto-pick one — the operator chooses a Sample ID themselves, which is
  // what then drives the Type/Parameter defaults via handleSampleIdChange.
  const handleSelectDate = async (date: Date) => {
    setSelectedDate(date);
    setIsDatePickerOpen(false);
    setIsLoadingSampleLab(true);
    try {
      const zDate = formatZDate(date);
      console.log("SampleLab ZDate sent to API:", zDate);
      const data = await fetchSampleLabByDate(zDate);
      applySampleLabResult(data);
      setSampleId("");
      setType("");
      setParameter("");
    } catch (err) {
      Alert.alert("Could not load samples", err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoadingSampleLab(false);
    }
  };

  // QR scan already identifies one specific sample, so (unlike date-select)
  // it auto-binds Sample ID, and Type/Parameter default from that sample's
  // own tCompleteParameters rows.
  const handleScanned = async (scannedId: string) => {
    setIsScannerOpen(false);
    setIsLoadingSampleLab(true);
    try {
      const data = await fetchSampleLabBySampleId(scannedId);
      applySampleLabResult(data);
      const id = data.samplE_ID || scannedId;
      const defaults = extractDefaultsForSample(data, id);
      setSampleId(id);
      setType(defaults.type);
      setParameter(defaults.parameter);
      applyRecordedWeights(data, id, defaults.type, defaults.parameter);
    } catch (err) {
      Alert.alert("Could not load sample", err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoadingSampleLab(false);
    }
  };

  // Weight isn't matched by W1-W4 source names — the mq stream carries the
  // balance readings under the selected machine's own source name (from
  // tMachineList), not per-slot sources. Pressing "Get Weight" on any slot
  // (W1-W4) captures whatever the currently selected
  // balance is reading right now and stores it under that specific slot
  // (with the capture time), independent of the other slots. Nothing
  // updates automatically as messages stream in — each slot holds exactly
  // what was captured at the moment its own button was pressed.
  const handleFetchWeight = (key: string) => {
    const match = messages.find((m) => sourceMatchesBalance(m.data, balance));
    if (!match) {
      Alert.alert("No data yet", `No live reading has been received for ${balance} yet.`);
      return;
    }
    const row = liveFeedRow(match);
    setWeights((prev) => prev.map((w) => (w.key === key ? { ...w, value: row.value, unit: row.unit, time: row.time } : w)));
  };

  // Clears just the one slot that was pressed, independent of the other
  // three — e.g. a mis-captured W2 reading shouldn't require redoing W1/W3/W4.
  const handleClearWeight = (key: string) => {
    setWeights((prev) => prev.map((w) => (w.key === key ? { ...w, value: null, unit: null, time: null } : w)));
  };

  const handleSubmit = async () => {
    if (!sampleId || !type || !parameter) {
      Alert.alert("Missing information", "Sample ID, Type, and Parameter are required before submitting.");
      return;
    }

    const weightFor = (key: string) => {
      if (disabledWeightSlots.includes(key)) return 0;
      const parsed = Number(weights.find((w) => w.key === key)?.value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    setIsSubmitting(true);
    try {
      const now = new Date();
      const erdat = formatZDate(now);
      const erzet = formatZTime(now);
      console.log("SampleLab submit erdat/erzet sent to API:", erdat, erzet);
      await submitSampleLabWeights({
        slnO_INBOUND: 0,
        inbounD_NO: "",
        slno: 0,
        maintaiN_TYPE: type,
        zparameter: parameter,
        samplE_ID: sampleId,
        disH_NUMBER: dishNumber,
        w1: weightFor("W1"),
        w2: weightFor("W2"),
        w3: weightFor("W3"),
        w4: weightFor("W4"),
        gcV1: 0,
        gcV2: 0,
        sulphur: 0,
        sodiuM_CARBONATE: 0,
        fusE_LENGTH: 0,
        samP_DT: "",
        samP_TM: "",
        zresult: 0,
        comP_FLAG: "",
        ernam: ERNAM,
        erdat,
        erzet,
      });

      const weightDetails = WEIGHT_SLOTS.filter((key) => !disabledWeightSlots.includes(key)).map((key) => ({
        label: key,
        value: `${weightFor(key)}`,
      }));

      setSubmissionResult({
        status: "success",
        title: "Submitted Successfully",
        message: "Sample weighing data was recorded and sent.",
        details: [
          { label: "Sample ID", value: sampleId },
          { label: "Type", value: type },
          { label: "Parameter", value: parameter },
          ...(dishNumber ? [{ label: "Dish No.", value: dishNumber }] : []),
          { label: "Balance", value: balance },
          ...weightDetails,
        ],
        reference: `${now.toLocaleDateString()} · ${now.toLocaleTimeString()}`,
      });

      resetAfterSubmit();
    } catch (err) {
      setSubmissionResult({
        status: "error",
        title: "Submission Failed",
        message: err instanceof Error ? err.message : String(err),
        details: [
          { label: "Sample ID", value: sampleId },
          { label: "Type", value: type },
          { label: "Parameter", value: parameter },
        ],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // The live feed shows only the currently selected balance's own traffic —
  // one row, the latest reading for it — not every message on the mq
  // stream regardless of source.
  const latestBalanceMessage = messages.find((m) => sourceMatchesBalance(m.data, balance));
  const latestBalanceRow = latestBalanceMessage ? liveFeedRow(latestBalanceMessage) : null;

  // Messages ARE arriving (the socket is open and receiving frames) but none
  // of them matched the selected balance — surfaces the mismatch (e.g. the
  // producer's source name doesn't actually line up with the selected
  // machine's name from tMachineList) right in the UI, instead of it just
  // silently looking identical to "no data at all arriving."
  const unmatchedLatestRow = latestBalanceRow === null && messages.length > 0 ? liveFeedRow(messages[0]) : null;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.dateRow}>
        <Pressable style={styles.dateField} onPress={() => setIsDatePickerOpen(true)}>
          <Text style={styles.label}>Date</Text>
          <View style={styles.dateValueRow}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={[styles.dateValueText, selectedDate === null && styles.dateValueTextPlaceholder]}>
              {formatDisplayDate(selectedDate)}
            </Text>
            {isLoadingSampleLab && <ActivityIndicator size="small" color={colors.primary} />}
          </View>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.qrButton, pressed && styles.qrButtonPressed]} onPress={() => setIsScannerOpen(true)}>
          <Ionicons name="qr-code-outline" size={22} color="#fff" />
        </Pressable>
      </View>

 

      <View style={styles.typeParameterRow}>
        <View style={styles.typeParameterField}>
          <SearchableSelect
            label="Type"
            value={type}
            onChangeValue={handleTypeChange}
            options={typeOptions}
            placeholder="Select date or scan QR to load types"
          />
        </View>

        <View style={styles.typeParameterField}>
          <SearchableSelect
            label="Parameter"
            value={parameter}
            onChangeValue={handleParameterChange}
            options={parameterOptions}
            placeholder={type ? "Select a parameter" : "Select a Type first"}
          />
        </View>
      </View>
     <SearchableSelect
        label="Sample ID"
        value={sampleId}
        onChangeValue={handleSampleIdChange}
        options={sampleIdOptions}
        placeholder={!type ? "Select a Type first" : !parameter ? "Select a Parameter first" : "Select a sample ID"}
      />
      <View style={styles.dishNumberField}>
        <Text style={styles.label}>Dish Number</Text>
        <TextInput
          style={styles.dishNumberInput}
          value={dishNumber}
          onChangeText={setDishNumber}
          placeholder="Enter dish number"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <RadioGroup
        label="Balance"
        value={balance}
        onChangeValue={setBalance}
        options={balanceOptions}
        getLabel={formatMachineLabel}
      />

      <View style={styles.weightsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Weight Readings</Text>
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[status] }]} />
            <Text style={styles.statusText}>{STATUS_LABEL[status]}</Text>
          </View>
        </View>
        {weights.map((reading, index) => {
          const accent = colors.slotAccents[index % colors.slotAccents.length];
          const isDisabled = disabledWeightSlots.includes(reading.key);
          return (
            <View
              key={reading.key}
              style={[styles.weightRow, { borderLeftColor: accent }, isDisabled && styles.weightRowDisabled]}
            >
              <View style={[styles.weightBadge, { backgroundColor: `${accent}1a` }]}>
                <Text style={[styles.weightBadgeText, { color: accent }]} numberOfLines={1}>
                  {reading.key}
                </Text>
              </View>

              <View style={styles.weightInfo}>
                {isDisabled ? (
                  <Text style={styles.weightPlaceholder} numberOfLines={1}>
                    Not applicable for {parameter}
                  </Text>
                ) : reading.value === null ? (
                  <Text style={styles.weightPlaceholder} numberOfLines={1}>
                    No reading yet
                  </Text>
                ) : (
                  <>
                    <Text style={[styles.weightValue, styles.weightValueCaptured]} numberOfLines={1}>
                      {reading.value}
                    </Text>
                    <Text style={styles.weightCapturedTime} numberOfLines={1}>
                      {reading.time}
                    </Text>
                  </>
                )}
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.fetchButton,
                  pressed && !isDisabled && styles.fetchButtonPressed,
                  isDisabled && styles.fetchButtonDisabled,
                ]}
                onPress={() => handleFetchWeight(reading.key)}
                disabled={isDisabled}
              >
                <Ionicons name="sync-outline" size={17} color="#fff" />
                <Text style={styles.fetchButtonText} numberOfLines={1}>
                  Get Weight
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.clearButton,
                  pressed && !isDisabled && reading.value !== null && styles.clearButtonPressed,
                  (isDisabled || reading.value === null) && styles.clearButtonDisabled,
                ]}
                onPress={() => handleClearWeight(reading.key)}
                disabled={isDisabled || reading.value === null}
                hitSlop={4}
              >
                <Ionicons
                  name="close-outline"
                  size={17}
                  color={isDisabled || reading.value === null ? colors.textMuted : colors.danger}
                />
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={styles.liveFeedCard}>
        <View style={styles.liveFeedHeader}>
          <Text style={styles.liveFeedTitle}>Live Balance Feed ({balance})</Text>
          <Text
            style={[
              styles.liveFeedStatus,
              status === "open" ? styles.liveFeedStatusConnected : styles.liveFeedStatusDisconnected,
            ]}
          >
            {LIVE_FEED_STATUS_LABEL[status]}
          </Text>
        </View>

        <View style={styles.liveFeedHeaderRow}>
          <Text style={[styles.liveFeedHeaderCell, styles.colTime]}>Time</Text>
          <Text style={[styles.liveFeedHeaderCell, styles.colSource]}>Source</Text>
          <Text style={[styles.liveFeedHeaderCell, styles.colMetric]}>Metric</Text>
          <Text style={[styles.liveFeedHeaderCell, styles.colValue]}>Value</Text>
          <Text style={[styles.liveFeedHeaderCell, styles.colUnit]}>Unit</Text>
        </View>

        {latestBalanceRow === null && unmatchedLatestRow !== null ? (
          <Text style={styles.liveFeedEmpty} numberOfLines={2}>
            {messages.length} message{messages.length === 1 ? "" : "s"} received, but none match &quot;{balance}&quot;
            — last source seen: &quot;{unmatchedLatestRow.source || "(empty)"}&quot;
          </Text>
        ) : latestBalanceRow === null ? (
          <Text style={styles.liveFeedEmpty}>Waiting for data…</Text>
        ) : (
          <View style={styles.liveFeedRow}>
            <Text style={[styles.liveFeedCell, styles.liveFeedCellNewest, styles.colTime]} numberOfLines={1}>
              {latestBalanceRow.time}
            </Text>
            <Text style={[styles.liveFeedCell, styles.liveFeedCellNewest, styles.colSource]} numberOfLines={1}>
              {latestBalanceRow.source}
            </Text>
            <Text style={[styles.liveFeedCell, styles.liveFeedCellNewest, styles.colMetric]} numberOfLines={1}>
              {latestBalanceRow.metric}
            </Text>
            <Text style={[styles.liveFeedCell, styles.liveFeedCellNewest, styles.colValue]} numberOfLines={1}>
              {latestBalanceRow.value}
            </Text>
            <Text style={[styles.liveFeedCell, styles.liveFeedCellNewest, styles.colUnit]} numberOfLines={1}>
              {latestBalanceRow.unit}
            </Text>
          </View>
        )}
      </View>

      {isParameterCompleted && (
        <View style={styles.completedBanner}>
          <Ionicons name="checkmark-done-circle" size={18} color={colors.success} />
          <Text style={styles.completedBannerText}>The process is completed for this parameter.</Text>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          pressed && styles.submitButtonPressed,
          isSubmitDisabled && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={isSubmitDisabled}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="checkmark-circle-outline" size={19} color="#fff" />
        )}
        <Text style={styles.submitButtonText}>{isSubmitting ? "Submitting…" : "Submit"}</Text>
      </Pressable>

      <QrScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanned={handleScanned}
      />

      <DatePickerModal
        visible={isDatePickerOpen}
        selectedDate={selectedDate}
        onClose={() => setIsDatePickerOpen(false)}
        onSelect={handleSelectDate}
      />

      <SubmissionResultModal result={submissionResult} onClose={() => setSubmissionResult(null)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 44,
    gap: 22,
    backgroundColor: colors.background,
  },
  qrButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  qrButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  dateField: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  dateValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    height: 48,
  },
  dateValueText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  dateValueTextPlaceholder: {
    color: colors.textMuted,
  },
  typeParameterRow: {
    flexDirection: "row",
    gap: 10,
  },
  typeParameterField: {
    flex: 1,
  },
  dishNumberField: {
    gap: 0,
  },
  dishNumberInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    fontSize: 15,
    color: colors.textPrimary,
  },
  weightsSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  weightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    borderLeftWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  weightRowDisabled: {
    opacity: 0.55,
  },
  weightBadge: {
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexShrink: 0,
  },
  weightBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  // Value + captured time sit right after the badge, in the same row.
  weightInfo: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  weightPlaceholder: {
    fontSize: 12,
    color: colors.textMuted,
  },
  weightValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  // Marks a value as freshly captured by "Get Weight".
  weightValueCaptured: {
    color: colors.success,
  },
  weightCapturedTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  fetchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexShrink: 0,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fetchButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  fetchButtonDisabled: {
    backgroundColor: colors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  fetchButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  clearButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.danger,
    flexShrink: 0,
  },
  clearButtonPressed: {
    backgroundColor: `${colors.danger}1a`,
  },
  clearButtonDisabled: {
    borderColor: colors.border,
  },
  // Dark card — separate from the light surface used everywhere else on
  // this screen, to read as a distinct "live telemetry" widget.
  liveFeedCard: {
    gap: 10,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.dark.background,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  liveFeedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  liveFeedTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.dark.textPrimary,
    flexShrink: 1,
  },
  liveFeedStatus: {
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 0,
  },
  liveFeedStatusConnected: {
    color: colors.dark.success,
  },
  liveFeedStatusDisconnected: {
    color: colors.dark.danger,
  },
  liveFeedHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
    paddingBottom: 8,
  },
  liveFeedHeaderCell: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.dark.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  liveFeedRow: {
    flexDirection: "row",
    paddingTop: 10,
  },
  liveFeedCell: {
    fontSize: 13,
    color: colors.dark.textPrimary,
  },
  liveFeedCellNewest: {
    color: colors.dark.success,
    fontWeight: "700",
  },
  liveFeedEmpty: {
    fontSize: 12,
    color: colors.dark.textMuted,
    paddingVertical: 10,
  },
  colTime: { flex: 1.4, paddingRight: 4 },
  colSource: { flex: 1, paddingRight: 4 },
  colMetric: { flex: 1.3, paddingRight: 4 },
  colValue: { flex: 1.1, paddingRight: 4 },
  colUnit: { flex: 0.7 },
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.successSoft,
  },
  completedBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: colors.success,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 4,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  submitButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
