import { hookstate, type State, useHookstate } from "@hookstate/core"
import { DashboardMeResponse, MeResponse, User, VerifyResponse } from "./types"



interface GoIamState {
    user?: User
    loadingMe: boolean
    verifying: boolean
    clientId: string
    clientAvailable: boolean
    baseUrl: string
    token?: string
    loginPageUrl: string
    callbackPageUrl: string
    err: string
    redirect: boolean
    loadedState: boolean
    verified: boolean // This is used to check if the user has verified their account
    localStoreUpdatedAt: string // This is used to check if the local storage has been updated
}

const state = hookstate<GoIamState>({
    clientAvailable: false,
    verifying: false,
    clientId: localStorage.getItem("client_id") || "",
    token: localStorage.getItem("access_token") || "",
    user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}") : undefined,
    loadingMe: false,
    err: "",
    baseUrl: "",
    loginPageUrl: "/login",
    callbackPageUrl: window.location.origin + "/verify",
    redirect: false,
    loadedState: false,
    verified: false, // This is used to check if the user has verified their account
    localStoreUpdatedAt: localStorage.getItem("localStoreUpdatedAt") || "", // This is used to check if the local storage has been updated
})

export interface GoIamWrapState {
    dashboardMe: (dontUpdateTime?: boolean) => Promise<void>
    me: () => Promise<void>,
    verify: (codeChallenge: string, code: string) => Promise<void>
    fetch: (url: string, init?: RequestInit) => Promise<Response>
    logout: () => void
    setBaseUrl: (url: string) => void
    setClientId: (id: string) => void
    login: () => void
    hasRequiredResources: (resources: string[]) => boolean
    setLoginPageUrl: (url: string) => void
    setCallbackPageUrl: (url: string) => void
    setLoadingMe: (loading: boolean) => void
    err: string
    loginPageUrl: string
    loadedState: boolean
    clientAvailable: boolean
    baseUrl: string
    clientId: string
    callbackPageUrl: string
    loadingMe: boolean
    verifying: boolean
    user?: User
    verified: boolean // This is used to check if the user has verified their account
}

const wrapState = (state: State<GoIamState>): GoIamWrapState => ({
    dashboardMe: (dontUpdateTime?: boolean) => {
        const lastUpdatedAt = new Date(state.localStoreUpdatedAt.value);
        const now = new Date();
        console.debug("Last updated at:", lastUpdatedAt, "Now:", now);
        if (!dontUpdateTime && now.getTime() - lastUpdatedAt.getTime() < 5 * 60 * 1000) {
            state.clientAvailable.set(state.clientId.value ? true : false);
            state.loadedState.set(true)
            console.debug("Skipping fetchMe as local store was updated recently");
            return Promise.resolve();
        }
        if (state.loadingMe.value) {
            console.debug("Already loading, ignoring new me request");
            return Promise.resolve();
        }
        state.loadingMe.set(true);
        const url = `${state.baseUrl.value}/me/v1/dashboard`;

        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };
        if (state.token.value && state.token.value.length > 0) {
            headers["Authorization"] = `Bearer ${state.token.value}`;
        }

        //normal fetch
        return fetch(url, {
            headers,
        })
            .then((response) => {
                if (!response.ok && response.status !== 401) {
                    throw new Error("Network response was not ok");
                }

                if (response.status === 401 && window.location.pathname !== state.loginPageUrl.value) {
                    window.location.href = state.loginPageUrl.value;
                }
                return response.json();
            })
            .then((data: DashboardMeResponse) => {
                // local caching variables
                if (!dontUpdateTime) {
                    const date = new Date().toISOString()
                    state.localStoreUpdatedAt.set(date);
                    localStorage.setItem("localStoreUpdatedAt", date);
                }
                state.clientId.set(data.data?.setup.client_id);
                localStorage.setItem("client_id", data.data?.setup.client_id || "");
                state.user.set(data.data?.user);
                localStorage.setItem("user", JSON.stringify(data.data?.user || null));
                console.debug("Fetched user:", data.data?.user);

                state.clientAvailable.set(data.data?.setup.client_id ? true : false);
                state.loadedState.set(true)

                state.loadingMe.set(false);
                return Promise.resolve();
            })
            .catch((error) => {
                state.clientAvailable.set(false);
                state.loadingMe.set(false);
                throw new Error(`Failed to fetch auth info: ${error.message}`);
            });
    },
    me: () => {
        if (state.loadingMe.value) {
            console.debug("Already loading, ignoring new me request");
            return Promise.resolve();
        }
        state.loadingMe.set(true);
        const url = `${state.baseUrl.value}/me/v1/`;

        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };
        if (state.token.value && state.token.value.length > 0) {
            headers["Authorization"] = `Bearer ${state.token.value}`;
        }

        //normal fetch
        return fetch(url, {
            headers,
        })
            .then((response) => {
                if (!response.ok && response.status !== 401) {
                    throw new Error("Network response was not ok");
                }

                if (response.status === 401 && window.location.pathname !== state.loginPageUrl.value) {
                    window.location.href = state.loginPageUrl.value;
                }
                return response.json();
            })
            .then((data: MeResponse) => {
                // local caching variables
                state.user.set(data.data);
                localStorage.setItem("user", JSON.stringify(data.data || null));
                console.debug("Fetched user:", data.data);
                state.loadedState.set(true)

                state.loadingMe.set(false);
            })
            .catch((error) => {
                state.loadingMe.set(false);
                throw new Error(`Failed to fetch auth info: ${error.message}`);
            });
    },
    verify: (codeChallenge: string, code: string) => {
        if (state.verifying.value) {
            console.debug("Already loading, ignoring new verify request");
            return Promise.resolve();
        }
        state.verifying.set(true);
        const url = `${state.baseUrl.value}/auth/v1/verify?code=${encodeURIComponent(code)}&code_challenge=${encodeURIComponent(codeChallenge)}&client_id=${encodeURIComponent(state.clientId.value)}`;
        //normal fetch
        return fetch(url, {
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                return response.json();
            })
            .then((data: VerifyResponse) => {
                if (!data.success) {
                    throw new Error(data.message || "Failed to verify the code");
                }
                state.token.set(data.data.access_token);
                localStorage.setItem("access_token", data.data.access_token);
                state.verified.set(true)
                state.verifying.set(false);
            })
            .catch((error) => {
                state.verifying.set(false);
                throw new Error(`Failed to verify the code: ${error.message}`);
            });
    },
    /**
   * Generate authentication URL
   * @returns Complete authentication URL
   */
    login() {
        const { code_challenge, code_challenge_method } = generatePKCECodes();
        const params = new URLSearchParams({
            client_id: state.clientId.value,
            redirect_url: state.callbackPageUrl.value,
            code_challenge,
            code_challenge_method,
        });

        window.location.href = `${state.baseUrl.value}/auth/v1/login?${params.toString()}`;
    },
    fetch: (url: string, init?: RequestInit) => {
        if (state.token.value && state.token.value.length > 0) {
            if (!init) {
                init = {};
            }
            const headers: Record<string, string> = (init.headers as Record<string, string>) || {};
            headers["Authorization"] = `Bearer ${state.token.value}`;
            init.headers = headers;
        }
        return fetch(url, {
            ...init,
        }).then((response) => {
            if (response.status === 401) {
                localStorage.setItem("loadedState", "false");
                window.location.href = state.loginPageUrl.value
            }
            return response;
        });
    },
    logout: () => {
        // locally cached variables
        const now = new Date();
        const updated = now.setMinutes(now.getMinutes() - 5);
        state.localStoreUpdatedAt.set(new Date(updated).toISOString());
        localStorage.setItem("localStoreUpdatedAt", new Date(updated).toISOString());
        state.clientId.set("");
        localStorage.removeItem("client_id");
        state.token.set("");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        state.user.set(undefined);

        // reset normal state
        state.clientAvailable.set(false);
        state.user.set(undefined);
        state.loadedState.set(false);
        state.verified.set(false);
        window.location.href = state.loginPageUrl.value;
    },
    setBaseUrl: (url: string) => {
        state.baseUrl.set(url);
    },
    setClientId: (id: string) => {
        state.clientId.set(id);
    },
    hasRequiredResources: (resources: string[]) => {
        if (!state.user.value) return false;
        const userResources = state.user.value?.resources || [];
        return resources.every(resource => userResources[resource]);
    },
    setLoginPageUrl: (url: string) => {
        state.loginPageUrl.set(url);
    },
    setCallbackPageUrl: (url: string) => {
        state.callbackPageUrl.set(url);
    },
    setLoadingMe: (loading: boolean) => {
        state.loadingMe.set(loading);
    },
    callbackPageUrl: state.callbackPageUrl.value,
    loginPageUrl: state.loginPageUrl.value,
    err: state.err.value,
    loadedState: state.loadedState.value,
    baseUrl: state.baseUrl.value,
    clientAvailable: state.clientAvailable.value,
    clientId: state.clientId.value,
    loadingMe: state.loadingMe.value,
    verifying: state.verifying.value,
    user: state.user.value,
    verified: state.verified.value,
})

function base64URLEncode(str: Uint8Array<ArrayBuffer>) {
    return btoa(String.fromCharCode(...Array.from(str)))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function generatePKCECodes() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const code_challenge = base64URLEncode(array);
    const code_challenge_method = "S256";

    return { code_challenge, code_challenge_method };
}


export const useGoIam = () => wrapState(useHookstate(state))