import Foundation

public class BiometricsSyncService: ObservableObject {
    public static let shared = BiometricsSyncService()

    @Published public var isLoggedIn: Bool = false
    @Published public var memberName: String?
    @Published public var memberEmail: String?
    @Published public var isSyncing: Bool = false
    @Published public var lastSyncTimestamp: String?
    @Published public var lastSyncedCount: Int = 0
    @Published public var errorMessage: String?
    @Published public var serverUrl: String = "http://localhost:5000"

    private let defaults = UserDefaults.standard

    public init() {
        loadSession()
    }

    public func loadSession() {
        let token = defaults.string(forKey: "fit_health_token")
        self.isLoggedIn = (token != nil && !token!.isEmpty)
        self.memberName = defaults.string(forKey: "fit_health_member_name")
        self.memberEmail = defaults.string(forKey: "fit_health_member_email")
        self.serverUrl = defaults.string(forKey: "fit_health_server_url") ?? "http://localhost:5000"
        self.lastSyncTimestamp = defaults.string(forKey: "fit_health_last_sync")
        self.lastSyncedCount = defaults.integer(forKey: "fit_health_last_count")
    }

    public func login(email: String, pass: String, url: String, completion: @escaping (Bool, String?) -> Void) {
        let cleanUrl = url.trimmingCharacters(in: .whitespacesAndNewlines).hasSuffix("/") ? String(url.dropLast()) : url
        guard let endpoint = URL(string: "\(cleanUrl)/api/auth/login") else {
            completion(false, "Invalid Server URL")
            return
        }

        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = ["email": email, "password": pass, "role": "member"]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        self.isSyncing = true
        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                self.isSyncing = false
                if let error = error {
                    completion(false, error.localizedDescription)
                    return
                }

                guard let data = data else {
                    completion(false, "Empty response from server")
                    return
                }

                do {
                    let decoded = try JSONDecoder().decode(LoginResponsePayload.self, from: data)
                    if decoded.success, let token = decoded.token {
                        self.defaults.set(token, forKey: "fit_health_token")
                        self.defaults.set(decoded.user?.name, forKey: "fit_health_member_name")
                        self.defaults.set(decoded.user?.email, forKey: "fit_health_member_email")
                        self.defaults.set(cleanUrl, forKey: "fit_health_server_url")

                        self.isLoggedIn = true
                        self.memberName = decoded.user?.name
                        self.memberEmail = decoded.user?.email
                        self.serverUrl = cleanUrl
                        completion(true, nil)
                    } else {
                        completion(false, decoded.message ?? "Authentication failed")
                    }
                } catch {
                    completion(false, "Unable to parse server response")
                }
            }
        }.resume()
    }

    public func syncTelemetry(records: [BiometricRecordDto], completion: @escaping (Bool, Int, String?) -> Void) {
        guard let token = defaults.string(forKey: "fit_health_token") else {
            completion(false, 0, "Member not authenticated")
            return
        }

        guard let endpoint = URL(string: "\(self.serverUrl)/api/biometrics/sync") else {
            completion(false, 0, "Invalid sync URL")
            return
        }

        let payload = SyncRequestPayload(
            provider: "apple-health",
            device: "iPhone / Apple Watch (HealthKit)",
            records: records
        )

        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        do {
            request.httpBody = try JSONEncoder().encode(payload)
        } catch {
            completion(false, 0, "Serialization error")
            return
        }

        self.isSyncing = true
        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                self.isSyncing = false
                if let error = error {
                    completion(false, 0, error.localizedDescription)
                    return
                }

                guard let data = data else {
                    completion(false, 0, "Empty sync response")
                    return
                }

                do {
                    let decoded = try JSONDecoder().decode(SyncResponsePayload.self, from: data)
                    if decoded.success {
                        let count = decoded.syncedCount ?? records.count
                        let nowStr = ISO8601DateFormatter().string(from: Date())
                        self.defaults.set(nowStr, forKey: "fit_health_last_sync")
                        self.defaults.set(count, forKey: "fit_health_last_count")
                        self.lastSyncTimestamp = nowStr
                        self.lastSyncedCount = count
                        completion(true, count, nil)
                    } else {
                        completion(false, 0, decoded.message ?? "Sync rejected by server")
                    }
                } catch {
                    completion(false, 0, "Failed to decode response")
                }
            }
        }.resume()
    }

    public func logout() {
        defaults.removeObject(forKey: "fit_health_token")
        defaults.removeObject(forKey: "fit_health_member_name")
        defaults.removeObject(forKey: "fit_health_member_email")
        self.isLoggedIn = false
        self.memberName = nil
        self.memberEmail = nil
    }
}

