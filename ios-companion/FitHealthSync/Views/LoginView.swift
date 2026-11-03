import SwiftUI

public struct LoginView: View {
    @ObservedObject var syncService = BiometricsSyncService.shared

    @State private var email: String = "alex@fithealth.io"
    @State private var pass: String = "password123"
    @State private var serverUrl: String = "http://localhost:5000"
    @State private var errorMessage: String?

    public init() {}

    public var body: some View {
        ZStack {
            Color(red: 11/255, green: 15/255, blue: 25/255)
                .ignoresSafeArea()

            VStack(spacing: 24) {
                Spacer()

                // Logo
                ZStack {
                    RoundedRectangle(cornerRadius: 18)
                        .fill(LinearGradient(colors: [Color(red: 255/255, green: 45/255, blue: 85/255), Color(red: 6/255, green: 182/255, blue: 212/255)], startPoint: .topLeading, endPoint: .bottomTrailing))
                        .frame(width: 72, height: 72)
                    Text("🍎")
                        .font(.system(size: 36))
                }

                VStack(spacing: 6) {
                    Text("Fit Health Sync")
                        .font(.title2)
                        .fontWeight(.black)
                        .foregroundColor(.white)

                    Text("Apple Health (HealthKit) → Fit Health Web App")
                        .font(.caption)
                        .foregroundColor(Color(red: 6/255, green: 182/255, blue: 212/255))
                }

                if let err = errorMessage {
                    Text(err)
                        .font(.caption)
                        .foregroundColor(.red)
                        .padding(10)
                        .background(Color.red.opacity(0.15))
                        .cornerRadius(8)
                }

                VStack(spacing: 14) {
                    TextField("Server Host (e.g. http://192.168.1.15:5000)", text: $serverUrl)
                        .padding()
                        .background(Color(red: 18/255, green: 25/255, blue: 39/255))
                        .cornerRadius(12)
                        .foregroundColor(.white)
                        .autocapitalization(.none)

                    TextField("Member Email", text: $email)
                        .padding()
                        .background(Color(red: 18/255, green: 25/255, blue: 39/255))
                        .cornerRadius(12)
                        .foregroundColor(.white)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)

                    SecureField("Password", text: $pass)
                        .padding()
                        .background(Color(red: 18/255, green: 25/255, blue: 39/255))
                        .cornerRadius(12)
                        .foregroundColor(.white)
                }
                .padding(.horizontal)

                Button(action: performLogin) {
                    if syncService.isSyncing {
                        ProgressView().progressViewStyle(CircularProgressViewStyle(tint: .black))
                    } else {
                        Text("Sign In & Connect HealthKit")
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(Color(red: 11/255, green: 15/255, blue: 25/255))
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(Color(red: 16/255, green: 185/255, blue: 129/255))
                .cornerRadius(12)
                .padding(.horizontal)
                .disabled(syncService.isSyncing)

                Spacer()
            }
        }
    }

    private func performLogin() {
        errorMessage = nil
        syncService.login(email: email, pass: pass, url: serverUrl) { success, error in
            if !success {
                self.errorMessage = error ?? "Failed to connect to Fit Health server"
            }
        }
    }
}

