interface ApiOption {
  method?: "PUT" | "POST" | "GET" | "DELETE" | "PATCH";
  headers?: Record<string, any>;
  body?: Record<string, any>;
  params?: Record<string, any>;
}

// State for handling token refresh and request queuing
let isRefreshing = false;
let requestQueue: {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  requestConfig: { url: string; method: "PUT" | "POST" | "GET" | "DELETE" | "PATCH"; headers: any; body?: any; params?: any };
}[] = [];

export const useApi = async (
  endpoint: string,
  { method = "GET", headers = {}, body, params }: ApiOption
) => {
  const { $ui } = useNuxtApp();

  const authStore = useAuthStore();
  const config = useRuntimeConfig();
  $ui.startLoader();
  try {
    const { $i18n } = useNuxtApp();
    const locale = $i18n.locale
    headers = {
      ...headers,
      'x-language':locale.value,
    }
  } catch (error) {
    console.log(error);
    
  }

  // Add authorization header if authenticated
  if (authStore.isAuthenticated && endpoint !== "/registry/v4/sessions") {
    headers = {
      ...headers,
      Authorization: `Bearer ${authStore.accessToken}`,
    };
  }

  // Helper to execute the request
  const executeRequest = async (additionalHeaders:Record<string,any>={})  =>
    $fetch(`${config.public.API_BASE_URL}${endpoint}`, {
      method,
     headers: {
        ...headers,
        ...additionalHeaders
      },
      body,
      params,
    });

  try {
    if(isRefreshing){
      return new Promise((resolve, reject) => {
        requestQueue.push({
          resolve,
          reject,
          requestConfig: {
            url: `${config.public.API_BASE_URL}${endpoint}`,
            method,
            headers,
            body,
            params,
          },
        });
      });
    }else{
        // Attempt the request
    return await executeRequest();
    }
    
  } catch (error: any) {
    // Handle 401 Unauthorized error
    if (error.response?.status === 401 && authStore.refreshToken) {
      // If token refresh is not already in progress, initiate it
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Refresh the access token
          const newAccessToken = await refreshAccessToken(authStore, config);

          // Update headers for queued requests
          requestQueue.forEach(({ resolve, requestConfig }) => {
            requestConfig.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(
              $fetch(requestConfig.url, {
                method: requestConfig.method,
                headers: requestConfig.headers,
                body: requestConfig.body,
                params: requestConfig.params,
              })
            );
          });

          // Clear the queue
          requestQueue = [];
          return executeRequest({
            Authorization : `Bearer ${newAccessToken}`
          }); // Retry the original request
        } catch (refreshError) {
          // Reject queued requests if token refresh fails
          requestQueue.forEach(({ reject }) => reject(refreshError));
          requestQueue = [];
          authStore.logout();
          useRedirectToStore().shouldLogin();
          throw new Error("Session expired. Please log in again.");
        } finally {
          isRefreshing = false;
        }
      } else {
        // If a token refresh is already in progress, queue the current request
        return new Promise((resolve, reject) => {
          requestQueue.push({
            resolve,
            reject,
            requestConfig: {
              url: `${config.public.API_BASE_URL}${endpoint}`,
              method,
              headers,
              body,
              params,
            },
          });
        });
      }
    } else {
      // Re-throw other errors
      throw error;
    }
  } finally {
    $ui.endLoader();
  }
};

// Helper function to refresh the access token
async function refreshAccessToken(authStore: any, config: any) {
  try {
    const refreshResponse = await $fetch(
      `${config.public.API_BASE_URL}/registry/v4/sessions/${authStore.sessionId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authStore.refreshToken}`,
        },
      }
    );
    console.log(refreshResponse);
    

    const accessToken = (refreshResponse as any).data.access_token;

    // Update the store with the new access token
    authStore.setAccessToken(accessToken);
    return accessToken;
  } catch (error) {

    console.log(error);
    
    throw new Error("Failed to refresh access token");
  }
}