import SwiftUI

@main
struct FitHealthSyncApp: App {
    @StateObject private var syncService = BiometricsSyncService.shared

    var body: some Scene {
        WindowGroup {
            if syncService.isLoggedIn {
                StatusView()
            } else {
                LoginView()
            }
        }
    }
}

