import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { Text, Button, DataTable, Modal, Portal, Chip, Searchbar, Card } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";

const Api_base_url = process.env.EXPO_PUBLIC_BASE_URL;

interface VehicleStatus {
  regno: string;
  gatepass: string;
  sM_RESULT?: string;
  arB_TM?: string;
  arB_VM?: string;
  status?: string;
}

const removeDuplicates = (arr: VehicleStatus[]) => {
  const uniqueMap = new Map<string, VehicleStatus>();
  arr.forEach((item) => uniqueMap.set(item.regno, item));
  return Array.from(uniqueMap.values());
};

export default function GetVehicleStatus() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [vehicleData, setVehicleData] = useState<VehicleStatus[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [visible, setVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleStatus | null>(null);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const formatApiDate = (date: Date) => date.toISOString().split("T")[0];

  const fetchVehicleData = async () => {
    try {
      setLoading(true);
      setError(null);

      const formattedDate = formatApiDate(selectedDate);
      const url = `${Api_base_url}/SampleStatus/GetVehicle/${formattedDate}`;
      const response = await axios.get(url);

      const { tRegGatepass = [], ttruckStatus = [] } = response.data;

      const mergedData: VehicleStatus[] = tRegGatepass.map((regItem: any) => {
        const statusMatch = ttruckStatus.find(
          (statusItem: any) => statusItem.regno.trim() === regItem.regno.trim()
        );
        return {
          regno: regItem.regno?.trim() || "N/A",
          gatepass: regItem.gatepass?.trim() || "N/A",
          sM_RESULT: statusMatch?.sM_RESULT || "",
          arB_TM: statusMatch?.arB_TM || "",
          arB_VM: statusMatch?.arB_VM || "",
          status: statusMatch?.status || "",
        };
      });

      setVehicleData(removeDuplicates(mergedData));
    } catch (error: any) {
      const err = error.response.data.Data.ErrorInfo;
      console.error('Login error:', err);
      setError(`${err.Key} : ${err.Message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleData();
  }, [selectedDate]);

  const handleOpenModal = (vehicle: VehicleStatus) => {
    setSelectedVehicle(vehicle);
    setVisible(true);
  };

  const handleCloseModal = () => {
    setVisible(false);
    setSelectedVehicle(null);
  };

  const filteredData = vehicleData.filter((item) =>
    item.regno.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    // <SafeAreaView style={styles.safeArea}>
    <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Date Selector Card */}
          <Card style={styles.card} elevation={2}>
            <Card.Content>
              <Text style={styles.cardLabel}>Select Date</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
                <Text style={styles.dateIcon}>📅</Text>
                <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>

          {showPicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowPicker(false);
                if (date) setSelectedDate(date);
              }}
            />
          )}

          {/* Search Bar */}
          <Searchbar
            placeholder="Search by vehicle number"
            onChangeText={setSearchText}
            value={searchText}
            style={styles.searchBar}
            iconColor="#043b76ff"
            placeholderTextColor="#999"
          />

          {/* Stats Card */}
          {!loading && !error && vehicleData.length > 0 && (
            <Card style={styles.statsCard} elevation={1}>
              <Card.Content style={styles.statsContent}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{filteredData.length}</Text>
                  <Text style={styles.statLabel}>Total Vehicles</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: '#28a745' }]}>
                    {filteredData.filter(v => v.status === 'ACCEPTED').length}
                  </Text>
                  <Text style={styles.statLabel}>Accepted</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: '#dc3545' }]}>
                    {filteredData.filter(v => v.status === 'REJECTED').length}
                  </Text>
                  <Text style={styles.statLabel}>Rejected</Text>
                </View>
              </Card.Content>
            </Card>
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#043b76ff" />
              <Text style={styles.loadingText}>Loading vehicles...</Text>
            </View>
          )}

          {error && (
            <Card style={styles.errorCard}>
              <Card.Content style={styles.errorContent}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </Card.Content>
            </Card>
          )}

          {!loading && !error && filteredData.length > 0 ? (
            <Card style={styles.tableCard} elevation={3}>
              {/* Table Header */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.tableContainer}>
                  <DataTable.Header style={styles.tableHeader}>
                    <DataTable.Title style={styles.headerCell} textStyle={styles.headerText}>Vehicle No.</DataTable.Title>
                    <DataTable.Title style={styles.headerCell} textStyle={styles.headerText}>Status</DataTable.Title>
                    <DataTable.Title style={styles.headerCellAction} textStyle={styles.headerText}>Actions</DataTable.Title>
                  </DataTable.Header>
                </View>
              </ScrollView>

              {/* Table Body */}
              <ScrollView style={styles.tableBodyScroll} showsVerticalScrollIndicator={true}>
                {/* <ScrollView horizontal showsHorizontalScrollIndicator={false}> */}
                  <DataTable style={styles.table}>
                    {filteredData.map((item, index) => (
                      <DataTable.Row 
                        key={index} 
                        style={[
                          styles.tableRow,
                          index % 2 === 0 ? styles.evenRow : styles.oddRow
                        ]}
                      >
                        <DataTable.Cell style={styles.cell}>
                          <View style={styles.regnoContainer}>
                            <Text style={styles.regnoText}>{item.regno}</Text>
                          </View>
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.cell}>
                          {item.status ? (
                            <Chip
                              icon={item.status === "ACCEPTED" ? "check-circle" : "close-circle"}
                              style={[
                                styles.statusChip,
                                { backgroundColor: item.status === "ACCEPTED" ? "#d4edda" : "#f8d7da" },
                              ]}
                              textStyle={[
                                styles.chipText,
                                { color: item.status === "ACCEPTED" ? "#155724" : "#721c24" },
                              ]}
                            >
                              {item.status}
                            </Chip>
                          ) : (
                            <Chip icon="clock-outline" style={styles.pendingChip} textStyle={styles.pendingChipText}>
                              Pending
                            </Chip>
                          )}
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.cellAction}>
                          <TouchableOpacity 
                            style={styles.viewButton}
                            onPress={() => handleOpenModal(item)}
                          >
                            <Text style={styles.viewButtonText}>View</Text>
                          </TouchableOpacity>
                        </DataTable.Cell>
                      </DataTable.Row>
                    ))}
                  </DataTable>
                {/* </ScrollView> */}
              </ScrollView>
            </Card>
          ) : (
            !loading && !error && (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Text style={styles.emptyIcon}>🚛</Text>
                  <Text style={styles.emptyText}>No vehicles found</Text>
                  <Text style={styles.emptySubtext}>
                    {searchText ? "Try adjusting your search" : "No data available for this date"}
                  </Text>
                </Card.Content>
              </Card>
            )
          )}
        </View>

        {/* Modal */}
        <Portal>
          <Modal visible={visible} onDismiss={handleCloseModal} contentContainerStyle={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vehicle Details</Text>
              {selectedVehicle?.status && (
                <Chip
                  icon={selectedVehicle.status === "ACCEPTED" ? "check-circle" : "close-circle"}
                  style={[
                    styles.modalStatusChip,
                    { backgroundColor: selectedVehicle.status === "ACCEPTED" ? "#28a745" : "#dc3545" },
                  ]}
                  textStyle={styles.modalChipText}
                >
                  {selectedVehicle.status}
                </Chip>
              )}
            </View>

            {selectedVehicle && (
              <View style={styles.detailContainer}>
                {[
                  ["Vehicle No.", selectedVehicle.regno],
                  ["Gatepass", selectedVehicle.gatepass],
                  ["SM Result", selectedVehicle.sM_RESULT || "N/A"],
                  ["ARB TM", selectedVehicle.arB_TM || "N/A"],
                  ["ARB VM", selectedVehicle.arB_VM || "N/A"],
                ].map(([label, value], i) => (
                  <React.Fragment key={i}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{label}</Text>
                      <Text style={styles.detailValue}>{value}</Text>
                    </View>
                    {i < 4 && <View style={styles.detailDivider} />}
                  </React.Fragment>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </Modal>
        </Portal>
      </ScrollView>
      </View>
    // </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: "#f8f9fa", 
    // flexGrow: 1,
    // paddingHorizontal: 16,
    paddingBottom: 32,
  },
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa", 
    padding: 16 ,
    // paddingBottom: 15,
  },
  headerCard: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  title: { 
    fontSize: 28, 
    fontWeight: "800", 
    color: "#043b76ff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "400",
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6c757d",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#043b76ff",
  },
  dateIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  dateText: { 
    fontSize: 16, 
    color: "#043b76ff", 
    fontWeight: "600",
    flex: 1,
  },
  searchBar: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fff",
  },
  statsCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  statsContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#043b76ff",
  },
  statLabel: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 4,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e9ecef",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    color: "#6c757d",
    fontSize: 14,
  },
  errorCard: {
    backgroundColor: "#fff3cd",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  errorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  errorIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  errorText: { 
    color: "#856404",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  tableCard: {
    borderRadius: 12,
    backgroundColor: "#fff",
    flex: 1,
    overflow: "hidden",
  },
  tableContainer: {
    minWidth: '100%',
  },
  table: { 
    backgroundColor: "transparent",
  },
  tableHeader: { 
    backgroundColor: "#043b76ff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    minWidth: '100%',
  },
  tableBodyScroll: {
    maxHeight: 400,
  },
  headerCell: {
    flex: 1,
    // justifyContent: "center",
  },
  headerCellAction: {
    flex: 1,
    justifyContent: "center",
  },
  headerText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    // textTransform: "uppercase",
  },
  tableRow: {
    minHeight: 72,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  evenRow: {
    backgroundColor: "#fff",
  },
  oddRow: {
    backgroundColor: "#f8f9fa",
  },
  cell: {
    flex: 2,
    alignItems: "center",
  },
  cellAction: {
    flex: 1,
    justifyContent: "center",
  },
  regnoContainer: {
    paddingVertical: 4,
  },
  regnoText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 2,
  },
  gatepassText: {
    fontSize: 12,
    color: "#6c757d",
    fontWeight: "500",
  },
  statusChip: { 
    // alignSelf: "flex-start",
    paddingHorizontal: 4,
  },
  chipText: { 
    fontSize: 12,
    fontWeight: "700",
  },
  pendingChip: {
    backgroundColor: "#fff3cd",
    // alignSelf: "flex-start",
  },
  pendingChipText: {
    color: "#856404",
    fontSize: 12,
    fontWeight: "700",
  },
  viewButton: {
    backgroundColor: "#043b76ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  viewButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  emptyCard: {
    borderRadius: 12,
    backgroundColor: "#fff",
    marginTop: 40,
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6c757d",
  },
  modal: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 16,
    padding: 24,
    // maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#043b76ff",
    flex: 1,
  },
  modalStatusChip: {
    marginLeft: 8,
  },
  modalChipText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  detailContainer: { 
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "600",
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    color: "#212529",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#e9ecef",
  },
  closeButton: {
    backgroundColor: "#043b76ff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});