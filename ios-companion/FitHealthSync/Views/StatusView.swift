import SwiftUI

public struct StatusView: View {
    @ObservedObject var syncService = BiometricsSyncService.shared
    @ObservedObject var healthKit = HealthKitManager.shared

    @State private var syncStatusMessage: String?

    public init() {}

    public var body: some View {
        ZStack {
            Color(red: 11/255, green: 15/255, blue: 25/255)
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 20) {
                    // Header
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Apple Health Bridge")
                                .font(.title3)
                                .fontWeight(.black)
                                .foregroundColor(.white)
                            Text("HealthKit Live Telemetry")
                                .font(.caption)
                                .foregroundColor(Color(red: 6/255, green: 182/255, blue: 212/255))
                        }
                        Spacer()
                        Text("ACTIVE")
                            .font(.caption2)
                            .fontWeight(.black)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(Color(red: 16/255, green: 185/255, blue: 129/255).opacity(0.15))
                            .foregroundColor(Color(red: 16/255, green: 185/255, blue: 129/255))
                            .cornerRadius(12)
                    }
                    .padding(.horizontal)
                    .padding(.top)

                    // Member Card
                    HStack(spacing: 16) {
                        Circle()
                            .fill(LinearGradient(colors: [Color(red: 16/255, green: 185/255, blue: 129/255), Color(red: 6/255, green: 182/255, blue: 212/255)], startPoint: .topLeading, endPoint: .bottomTrailing))
                            .frame(width: 50, height: 50)
                            .overlay(
                                Text(syncService.memberName?.prefix(1).uppercased() ?? "M")
                                    .fontWeight(.black)
                                    .foregroundColor(Color(red: 11/255, green: 15/255, blue: 25/255))
                            )

                        VStack(alignment: .leading, spacing: 2) {
                            Text(syncService.memberName ?? "Gym Athlete")
                                .font(.headline)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                            Text(syncService.memberEmail ?? "")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        Spacer()
                    }
                    .padding()
                    .background(Color(red: 18/255, green: 25/255, blue: 39/255))
                    .cornerRadius(16)
                    .padding(.horizontal)

                    // Permissions Card
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Image(systemName: healthKit.isAuthorized ? "checkmark.circle.fill" : "exclamationmark.triangle.fill")
                                .foregroundColor(healthKit.isAuthorized ? .green : .orange)
                            Text("Apple Health Permissions")
                                .font(.subheadline)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                            Spacer()
                        }

                        Text("Steps, Heart Rate, Sleep, Active Energy, SpO2 & VO2 Max authorized.")
                            .font(.caption)
                            .foregroundColor(.gray)

                        if !healthKit.isAuthorized {
                            Button(action: {
                                healthKit.requestAuthorization { _, _ in }
                            }) {
                                Text("Grant HealthKit Permissions")
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 8)
                                    .background(Color.orange)
                                    .foregroundColor(.black)
                                    .cornerRadius(8)
                            }
                        }
                    }
                    .padding()
                    .background(Color(red: 18/255, green: 25/255, blue: 39/255))
                    .cornerRadius(16)
                    .padding(.horizontal)

                    // Telemetry Status
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Telemetry Pipeline")
                            .font(.subheadline)
                            .fontWeight(.bold)
                            .foregroundColor(.white)

                        HStack {
                            Text("Last Synced:")
                                .font(.caption)
                                .foregroundColor(.gray)
                            Spacer()
                            Text(syncService.lastSyncTimestamp ?? "Never synced")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                        }

                        HStack {
                            Text("Last Batch Upload:")
                                .font(.caption)
                                .foregroundColor(.gray)
                            Spacer()
                            Text("\(syncService.lastSyncedCount) metrics")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(Color(red: 16/255, green: 185/255, blue: 129/255))
                        }
                    }
                    .padding()
                    .background(Color(red: 18/255, green: 25/255, blue: 39/255))
                    .cornerRadius(16)
                    .padding(.horizontal)

                    if let msg = syncStatusMessage {
                        Text(msg)
                            .font(.caption)
                            .foregroundColor(.green)
                    }

                    // Sync Now Button
                    Button(action: triggerSync) {
                        if syncService.isSyncing {
                            ProgressView().progressViewStyle(CircularProgressViewStyle(tint: .black))
                        } else {
                            HStack {
                                Image(systemName: "arrow.triangle.2.circlepath")
                                Text("Sync Now to Fit Health Web App")
                                    .fontWeight(.bold)
                            }
                            .foregroundColor(Color(red: 11/255, green: 15/255, blue: 25/255))
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(Color(red: 16/255, green: 185/255, blue: 129/255))
                    .cornerRadius(12)
                    .padding(.horizontal)
                    .disabled(syncService.isSyncing)

                    // Logout Button
                    Button(action: { syncService.logout() }) {
                        Text("Disconnect Companion App")
                            .font(.caption)
                            .foregroundColor(Color(red: 244/255, green: 63/255, blue: 94/255))
                    }
                    .padding(.top, 10)
                }
            }
        }
    }

    private func triggerSync() {
        syncStatusMessage = nil
        healthKit.fetchRecentTelemetry { records in
            syncService.syncTelemetry(records: records) { success, count, error in
                if success {
                    self.syncStatusMessage = "Successfully pushed \(count) HealthKit metrics!"
                } else {
                    self.syncStatusMessage = "Sync failed: \(error ?? "Unknown error")"
                }
            }
        }
    }
}

