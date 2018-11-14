import axios from "axios";
import Qs from "qs";

/**
 * Determine the correct domain to communicate with based on the current applicaiton domain.
 * @return {String}
 */
export function _getApiDomain(currentDomain = window.location.hostname) {
  const apiDomains = {
    "beta.kitepaint.com": "https://api.beta.kitepaint.com/php",
    "kitepaint.com": "https://api.kitepaint.com/php",
    default: "https://api.beta.kitepaint.com/php"
  };
  return apiDomains[currentDomain] || apiDomains.default;
}

/**
 * A class the provides methods for interacting with the KitePaint REST API
 */
export class KitePaintApi {
  constructor() {
    this.config = {
      baseURL: this.baseUrl,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data"
      }
    };

    this.axiosInstance = axios.create(this.config);
  }

  /**
   * The base url for all API requests
   * @type {String}
   */
  baseUrl = _getApiDomain();

  /**
   * The axios configuration.
   * @type {Object}
   */
  config = {};

  /**
   * The axios instance.
   * @type {Axios}
   */
  axiosInstance = null;

  /**
   * Check if the user is already logged in based on session data.
   * @return {Promise}
   */
  async checkLoginStatus() {
    // Get the user data from session storage
    const sessionData = sessionStorage.getItem("user");
    let parsedSessionData;
    try {
      parsedSessionData = JSON.parse(sessionData);
    } catch {
      parsedSessionData = false;
    }

    // If we had no user data, reject.
    if (!parsedSessionData) {
      return new Promise((resolve, reject) =>
        reject({
          data: "No session data was found. The user is not logged in."
        })
      );
    }

    // Build the form data
    const bodyFormData = new FormData();
    Object.keys(parsedSessionData).forEach(key =>
      bodyFormData.append(key, parsedSessionData[key])
    );
    bodyFormData.append("update_login", true);

    // Make the request
    const response = await this.axiosInstance.post("/index.php", bodyFormData);

    // If the response has no data or indicates that the user is not logged in, reject.
    if (!response.data || !response.data.logged_in) {
      return new Promise((resolve, reject) => reject(response));
    }

    // Store the user data in session storage
    sessionStorage.setItem("user", JSON.stringify(response.data));

    // Return the response
    return response;
  }

  /**
   * Log in to a KitePaint account.
   * @param  {String}  username
   * @param  {String}  password
   * @return {Promise}
   */
  async logIn(username, password) {
    // Build the form data
    const bodyFormData = new FormData();
    bodyFormData.append("username", username);
    bodyFormData.append("password", password);

    // Make the request
    const response = await this.axiosInstance.post("/index.php", bodyFormData);

    // If the response has no data or indicates that the user is not logged in, reject.
    if (!response.data || !response.data.logged_in) {
      return new Promise((resolve, reject) =>
        reject(
          response.data
            ? response.data.message
            : "The log in request was unsuccessful"
        )
      );
    }

    // Store the user data in session storage
    sessionStorage.setItem("user", JSON.stringify(response.data));

    // Return the response
    return response;
  }

  /**
   * Logs out the user and destroys their session.
   * @return {Promise}
   */
  async logOut() {
    await this.axiosInstance.post("/logout.php");
    sessionStorage.removeItem("user");
  }

  /**
   * Sends a request to register a new KitePaint account.
   * @param  {Object}  data Must contain `{username, email, password, password2}`
   * @return {Promise}
   */
  async register(data) {
    // Build the form data
    const bodyFormData = new FormData();
    Object.keys(data).forEach(key => bodyFormData.append(key, data[key]));

    // Make the request
    const response = await this.axiosInstance.post(
      "/register.php",
      bodyFormData
    );

    // If there's no data, or if the data returns with registered as false, reject.
    if (!response.data || !response.data.registered) {
      return new Promise((resolve, reject) =>
        reject(
          response.data
            ? response.data.message
            : "The registration request was unsuccessful"
        )
      );
    }
    return response;
  }

  /**
   * Sends a request to reset a user's password.
   * @param  {String} username The username of the user to reset the password for.
   * @param  {String} email The email address that is on the user's account.
   * @return {Promise}
   */
  async resetPassword(username, email) {
    // Build the form data
    const bodyFormData = new FormData();
    bodyFormData.append("username", username);
    bodyFormData.append("email", email);

    // Make the request
    const response = await this.axiosInstance.post(
      "/lostpassword.php",
      bodyFormData
    );
    // If there's no data, or if the data returns with reset as false, reject.
    if (!response.data || !response.data.reset) {
      return new Promise((resolve, reject) =>
        reject(
          response.data
            ? response.data.message
            : "The reset password request was unsuccessful."
        )
      );
    }
    return response;
  }

  /**
   * A cache for getDesigns requests to prevent making the same request repeatedly.
   * @type {Array}
   * @private
   */
  _getDesignsCache = [];

  /**
   * Get saved designs.
   * @param  {Object}  [filter={}] A list of filters. See filterDefaults as an example.
   * @param {Boolean} [useCache=true] If true, the request will be cached, and subsequent duplicate
   * requests will not be made within 10 minutes.
   * @return {Promise}
   */
  async getDesigns(filter = {}, useCache = true) {
    // Define the default filtes and merge them with the user provided filters
    const filterDefaults = {
      isPublic: true,
      limit: 50
    };
    const filterWithDefaults = Object.assign({}, filterDefaults, filter);

    // Build the request data to be sent to the server as query params
    const requestData = {
      filter: {
        active: 1
      },
      return: ["id", "created", "name", "variations"],
      limit: filterWithDefaults.limit,
      order: ["id", "DESC"]
    };
    if (filterWithDefaults.isPublic) {
      requestData.filter.status = 2;
    }

    // Convert the request data to query params using Qs. This is done because providing nested
    // parms to Axios's params config prop doesn't work correctly.
    const requestString = Qs.stringify(requestData);

    // Look for cached values if useCache is true
    if (useCache) {
      const relevantCache = this._getDesignsCache.find(
        cache => cache.value === requestString
      );
      if (relevantCache) {
        const cacheDuration = 10 * 60 * 1000; // 10 minutes
        const currentTime = new Date().getTime();
        if (relevantCache.cacheTime + cacheDuration >= currentTime) {
          return new Promise(resolve =>
            resolve({
              data: []
            })
          );
        }
      }

      this._getDesignsCache.push({
        cacheTime: new Date().getTime(),
        value: requestString
      });
    }

    // Make the request
    const response = await this.axiosInstance.get(
      `/designs.php?${requestString}`
    );

    // Handle invalid responses
    if (!response.data) {
      return new Promise((resolve, reject) =>
        reject(
          response.data
            ? response.data.message
            : "The request for designs was unsuccessful"
        )
      );
    }

    response.data = response.data.map(design => {
      design.variations = JSON.parse(design.variations);
      return design;
    });

    return response;
  }

  _getProductsCache = [];
  async getProducts(useCache = true) {
    // Look for cached values if useCache is true
    if (useCache) {
      const relevantCache = this._getProductsCache[0];

      if (relevantCache) {
        const cacheDuration = 10 * 60 * 1000; // 10 minutes
        const currentTime = new Date().getTime();
        if (relevantCache.cacheTime + cacheDuration >= currentTime) {
          return new Promise(resolve =>
            resolve({
              data: []
            })
          );
        }
      }

      this._getProductsCache.push({
        cacheTime: new Date().getTime()
      });
    }

    // Make the request
    const response = await this.axiosInstance.get(`/products.php`, {
      params: {
        activated: 1
      }
    });

    // Handle invalid responses
    if (!response.data) {
      return new Promise((resolve, reject) =>
        reject(
          response.data
            ? response.data.message
            : "The request for products was unsuccessful"
        )
      );
    }

    response.data = response.data.map(product => {
      product.variations = JSON.parse(product.variations);
      product.colors = JSON.parse(product.colors);
      return product;
    });

    return response;
  }

  _getManufacturersCache = [];
  async getManufacturers(useCache = true) {
    // Look for cached values if useCache is true
    if (useCache) {
      const relevantCache = this._getManufacturersCache[0];

      if (relevantCache) {
        const cacheDuration = 10 * 60 * 1000; // 10 minutes
        const currentTime = new Date().getTime();
        if (relevantCache.cacheTime + cacheDuration >= currentTime) {
          return new Promise(resolve =>
            resolve({
              data: []
            })
          );
        }
      }

      this._getManufacturersCache.push({
        cacheTime: new Date().getTime()
      });
    }

    // Make the request
    const response = await this.axiosInstance.get(`/manufacturers.php`, {
      params: {
        activated: 1
      }
    });

    // Handle invalid responses
    if (!response.data) {
      return new Promise((resolve, reject) =>
        reject(
          response.data
            ? response.data.message
            : "The request for manufacturers was unsuccessful"
        )
      );
    }

    return response;
  }
}

export default new KitePaintApi();
