export default {
  expo: {
    name: "감또리네",
    slug: "gamttori-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/happy_gamttori.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.gamttori.app",
      adaptiveIcon: {
        foregroundImage: "./assets/images/happy_gamttori.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      supabaseUrl: process.env.SUPABASE_URL || "https://afvsmtyxdlmxuwdipepq.supabase.co",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmdnNtdHl4ZGxteHV3ZGlwZXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjU5OTMsImV4cCI6MjA3MzY0MTk5M30.iY1WZjqOd7Y5IEYHntNU4XbsGMNy8B5znA_g-opEzPY",
      eas: {
        projectId: "38862495-f1e5-4cd5-9d9f-ebc95c069cdb" // ✅ 새로 발급된 ID
      }
    }
  }
};
