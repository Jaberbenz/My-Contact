const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

console.log("🌐 [API CLIENT] API_URL configurée:", API_URL);

class ApiClient {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    console.log(`🌐 [API] ${options.method || "GET"} ${endpoint}`);
    if (options.body) {
      console.log("🌐 [API] Body:", JSON.parse(options.body));
    }
    if (token) {
      console.log(
        "🌐 [API] Token présent (20 premiers car):",
        token.substring(0, 20) + "..."
      );
    }

    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      console.log(`🌐 [API] Réponse status:`, response.status);

      if (response.status === 401) {
        console.log("❌ [API] 401 - Déconnexion forcée");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
        throw new Error("Non autorisé");
      }

      const data = await response.json();
      console.log("🌐 [API] Données reçues:", data);

      if (!response.ok) {
        console.log("❌ [API] Erreur:", data.message);
        throw new Error(data.message || "Une erreur est survenue");
      }

      console.log("✅ [API] Succès");
      return data;
    } catch (error) {
      console.error("❌ [API] Exception:", error);
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

const apiClient = new ApiClient();
export default apiClient;
