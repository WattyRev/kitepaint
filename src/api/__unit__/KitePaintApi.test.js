import { _getApiDomain, KitePaintApi } from "../KitePaintApi";

function getObjectFromFormData(formData) {
  const keys = [];
  for (let key of formData.keys()) {
    keys.push(key);
  }
  return keys.reduce((accumulatedObject, key) => {
    const value = formData.get(key);
    accumulatedObject[key] = value;
    return accumulatedObject;
  }, {});
}

describe("KitePaintApi", () => {
  describe("_getApiDomain", () => {
    it("returns the beta location if we are at beta.kitepaint.com", () => {
      expect.assertions(1);
      const result = _getApiDomain("beta.kitepaint.com");
      expect(result).toEqual("https://api.beta.kitepaint.com/php");
    });
    it("returns the prod location if we are at kitepaint.com", () => {
      expect.assertions(1);
      const result = _getApiDomain("kitepaint.com");
      expect(result).toEqual("https://api.kitepaint.com/php");
    });
    it("returns the beta location if we are anywhere else", () => {
      expect.assertions(1);
      const result = _getApiDomain("localhost:1234");
      expect(result).toEqual("https://api.beta.kitepaint.com/php");
    });
  });

  let Api;
  beforeEach(() => {
    Api = new KitePaintApi();
    Api.axiosInstance = {
      post: jest.fn().mockResolvedValue({}),
      get: jest.fn().mockResolvedValue({})
    };
  });

  describe("#checkLoginStatus", () => {
    beforeEach(() => {
      sessionStorage.setItem(
        "user",
        JSON.stringify({
          foo: "bar"
        })
      );
    });
    afterEach(() => {
      sessionStorage.removeItem("user");
    });
    it("rejects if there's no user data in the sesion", () => {
      expect.assertions(1);
      sessionStorage.removeItem("user");
      return Api.checkLoginStatus().catch(error => {
        expect(error.data).toEqual(
          "No session data was found. The user is not logged in."
        );
      });
    });
    it("sends the user information from the session to the server", () => {
      expect.assertions(2);
      return Api.checkLoginStatus().catch(() => {
        const args = Api.axiosInstance.post.mock.calls[0];
        expect(args[0]).toEqual("/index.php");
        const parsedData = getObjectFromFormData(args[1]);
        expect(parsedData).toEqual({
          foo: "bar",
          update_login: "true"
        });
      });
    });
    it("rejects if the server responds with no data", () => {
      expect.assertions(1);
      Api.axiosInstance.post.mockReturnValue(
        new Promise(resolve => resolve({}))
      );
      return Api.checkLoginStatus().catch(() => {
        expect(true).toEqual(true);
      });
    });
    it("rejects if the request fails", () => {
      expect.assertions(1);
      Api.axiosInstance.post.mockReturnValue(
        new Promise((resolve, reject) => reject())
      );
      return Api.checkLoginStatus().catch(() => {
        expect(true).toEqual(true);
      });
    });
    it("rejects if the server responds with logged_in as a falsey value", () => {
      expect.assertions(1);
      Api.axiosInstance.post.mockReturnValue(
        new Promise(resolve =>
          resolve({
            data: {
              logged_in: false
            }
          })
        )
      );
      return Api.checkLoginStatus().catch(() => {
        expect(true).toEqual(true);
      });
    });
    it("sets the user information in session storage, and resolves with the user data", () => {
      expect.assertions(2);
      Api.axiosInstance.post.mockReturnValue(
        new Promise(resolve =>
          resolve({
            data: {
              logged_in: true,
              boogers: "and stuff"
            }
          })
        )
      );
      return Api.checkLoginStatus().then(response => {
        const expectedValue = {
          logged_in: true,
          boogers: "and stuff"
        };
        expect(sessionStorage.getItem("user")).toEqual(
          JSON.stringify(expectedValue)
        );
        expect(response).toEqual({ data: expectedValue });
      });
    });
  });

  describe("#logIn", () => {
    afterEach(() => {
      sessionStorage.removeItem("user");
    });
    it("should send the provided data to the correct API", () => {
      expect.assertions(2);
      return Api.logIn("frank", "frankspassword").catch(() => {
        const call = Api.axiosInstance.post.mock.calls[0];
        expect(call[0]).toEqual("/index.php");
        const data = getObjectFromFormData(call[1]);
        expect(data).toEqual({
          username: "frank",
          password: "frankspassword"
        });
      });
    });
    it("should reject if the API returns no data", () => {
      expect.assertions(1);
      return Api.logIn("frank", "franksPassword").catch(() => {
        expect(true).toEqual(true);
      });
    });
    it("should reject if the API indicates that the user is not logged in", () => {
      expect.assertions(1);
      Api.axiosInstance.post.mockReturnValue(
        new Promise(resolve =>
          resolve({
            data: {
              logged_in: false
            }
          })
        )
      );
      return Api.logIn("frank", "franksPassword").catch(() => {
        expect(true).toEqual(true);
      });
    });
    it("should reject if the API call fails", () => {
      expect.assertions(1);
      Api.axiosInstance.post.mockReturnValue(
        new Promise((resolve, reject) => reject())
      );
      return Api.logIn("frank", "franksPassword").catch(() => {
        expect(true).toEqual(true);
      });
    });
    it("should update the user data in the session and return the data", () => {
      expect.assertions(2);
      Api.axiosInstance.post.mockReturnValue(
        new Promise(resolve =>
          resolve({
            data: {
              logged_in: true,
              abc: "def"
            }
          })
        )
      );
      return Api.logIn("frank", "franksPassword").then(response => {
        const expected = {
          logged_in: true,
          abc: "def"
        };
        expect(sessionStorage.getItem("user")).toEqual(
          JSON.stringify(expected)
        );
        expect(response).toEqual({ data: expected });
      });
    });
  });

  describe("#logOut", () => {
    afterEach(() => {
      sessionStorage.removeItem("user");
    });
    it("makes a request to the correct url", () => {
      expect.assertions(1);
      return Api.logOut().then(() => {
        expect(Api.axiosInstance.post.mock.calls[0][0]).toEqual("/logout.php");
      });
    });
    it("rejects if the request fails", () => {
      expect.assertions(1);
      Api.axiosInstance.post.mockReturnValue(
        new Promise((resolve, reject) => reject())
      );
      return Api.logOut().catch(() => {
        expect(true).toEqual(true);
      });
    });
    it("removes the user from session storage", () => {
      expect.assertions(1);
      sessionStorage.setItem("user", "foo");
      return Api.logOut().then(() => {
        expect(sessionStorage.getItem("user")).toEqual(null);
      });
    });
  });

  describe("#register", () => {
    it("makes the correct request with the provided data", () => {
      expect.assertions(2);
      Api.register({
        a: "b",
        foo: "bar"
      }).catch(() => {});
      const call = Api.axiosInstance.post.mock.calls[0];
      expect(call[0]).toEqual("/register.php");
      expect(getObjectFromFormData(call[1])).toEqual({
        a: "b",
        foo: "bar"
      });
    });
    it("rejects if the api call fails", () => {
      expect.assertions(1);
      Api.axiosInstance.post.mockReturnValue(
        new Promise((resolve, reject) => reject())
      );
      return Api.register({
        a: "b",
        foo: "bar"
      }).catch(() => {
        expect(true).toEqual(true);
      });
    });
    it("should reject if the api returns no data", () => {
      expect.assertions(1);
      Api.axiosInstance.post.mockReturnValue(
        new Promise(resolve => resolve({}))
      );
      return Api.register({
        a: "b",
        foo: "bar"
      }).catch(() => {
        expect(true).toEqual(true);
      });
    });
    it("should reject if the api indicates that the password was not reset", () => {
      expect.assertions(1);
      Api.axiosInstance.post.mockReturnValue(
        new Promise(resolve =>
          resolve({
            data: {
              registered: false
            }
          })
        )
      );
      return Api.register({
        a: "b",
        foo: "bar"
      }).catch(() => {
        expect(true).toEqual(true);
      });
    });
    it("should resolve if the response is appropriate", () => {
      expect.assertions(1);
      Api.axiosInstance.post.mockReturnValue(
        new Promise(resolve =>
          resolve({
            data: {
              registered: true
            }
          })
        )
      );
      return Api.register({
        a: "b",
        foo: "bar"
      }).then(() => {
        expect(true).toEqual(true);
      });
    });
  });

  describe("#resetPassword", () => {
    it("should make the correct request with the provided data", () => {
      expect.assertions(3);
      Api.resetPassword("stuff", "things@poop.com").catch(() => {});
      expect(Api.axiosInstance.post.mock.calls).toHaveLength(1);
      const postCall = Api.axiosInstance.post.mock.calls[0];
      expect(postCall[0]).toEqual("/lostpassword.php");
      expect(getObjectFromFormData(postCall[1])).toEqual({
        username: "stuff",
        email: "things@poop.com"
      });
    });
    it("should reject if the api call fails", () => {
      expect.assertions(1);
      Api.axiosInstance.post.mockReturnValue(
        new Promise((resolve, reject) => reject({}))
      );
      return Api.resetPassword("stuff", "things@poop.com").catch(() => {
        expect(true).toEqual(true);
      });
    });
    it("should reject if the api returns no data", () => {
      expect.assertions(1);
      Api.axiosInstance.post.mockReturnValue(
        new Promise(resolve => resolve({}))
      );
      return Api.resetPassword("stuff", "things@poop.com").catch(() => {
        expect(true).toEqual(true);
      });
    });
    it("should reject if the api indicates that the password was not reset", () => {
      expect.assertions(1);
      Api.axiosInstance.post.mockReturnValue(
        new Promise(resolve =>
          resolve({
            data: {
              reset: false
            }
          })
        )
      );
      return Api.resetPassword("stuff", "things@poop.com").catch(() => {
        expect(true).toEqual(true);
      });
    });
    it("should resolve if the response is appropriate", () => {
      expect.assertions(1);
      Api.axiosInstance.post.mockReturnValue(
        new Promise(resolve =>
          resolve({
            data: {
              reset: true
            }
          })
        )
      );
      return Api.resetPassword("stuff", "things@poop.com").then(() => {
        expect(true).toEqual(true);
      });
    });
  });

  describe("#getDesigns", () => {
    beforeEach(() => {
      Api._getDesignsCache = [];
    });
    it("makes the relevant request", () => {
      expect.assertions(1);
      Api.getDesigns().catch(() => {});
      expect(Api.axiosInstance.get.mock.calls[0][0]).toEqual(
        "/designs.php?filter%5Bactive%5D=1&filter%5Bstatus%5D=2&return%5B0%5D=id&return%5B1%5D=created&return%5B2%5D=name&return%5B3%5D=variations&limit=50&order%5B0%5D=id&order%5B1%5D=DESC"
      );
    });
    it("adopts the provided filters", () => {
      expect.assertions(1);
      Api.getDesigns({
        isPublic: false,
        limit: 5
      }).catch(() => {});
      expect(Api.axiosInstance.get.mock.calls[0][0]).toEqual(
        "/designs.php?filter%5Bactive%5D=1&return%5B0%5D=id&return%5B1%5D=created&return%5B2%5D=name&return%5B3%5D=variations&limit=5&order%5B0%5D=id&order%5B1%5D=DESC"
      );
    });
    it("does not make identical requests when they have been cached", () => {
      expect.assertions(1);
      Api.getDesigns().catch(() => {});
      Api.getDesigns().catch(() => {});
      expect(Api.axiosInstance.get.mock.calls).toHaveLength(1);
    });
    it("does make identical requests when caching is disabled", () => {
      expect.assertions(1);
      Api.getDesigns({}, false).catch(() => {});
      Api.getDesigns({}, false).catch(() => {});
      expect(Api.axiosInstance.get.mock.calls).toHaveLength(2);
    });
    it("rejects if the request fails", () => {
      expect.assertions(1);
      Api.axiosInstance.get.mockRejectedValue();
      return Api.getDesigns().catch(() => {
        expect(true).toEqual(true);
      });
    });
    it("rejects if the request returns with no data", () => {
      expect.assertions(1);
      Api.axiosInstance.get.mockResolvedValue({});
      return Api.getDesigns().catch(() => {
        expect(true).toEqual(true);
      });
    });
    it("resolves with the data", () => {
      expect.assertions(1);
      Api.axiosInstance.get.mockResolvedValue({
        data: [
          {
            id: "123",
            variations: "[]"
          }
        ]
      });
      return Api.getDesigns().then(response => {
        expect(response).toEqual({
          data: [
            {
              id: "123",
              variations: []
            }
          ]
        });
      });
    });
  });

  describe("#getProducts", () => {
    beforeEach(() => {
      Api._getProductsCache = [];
    });
    it("makes the relevant request", () => {
      expect.assertions(2);
      Api.getProducts().catch(() => {});
      expect(Api.axiosInstance.get.mock.calls[0][0]).toEqual("/products.php");
      expect(Api.axiosInstance.get.mock.calls[0][1]).toEqual({
        params: { activated: 1 }
      });
    });
    it("does not make identical requests when they have been cached", () => {
      expect.assertions(1);
      Api.getProducts().catch(() => {});
      Api.getProducts().catch(() => {});
      expect(Api.axiosInstance.get.mock.calls).toHaveLength(1);
    });
    it("does make identical requests when caching is disabled", () => {
      expect.assertions(1);
      Api.getProducts(false).catch(() => {});
      Api.getProducts(false).catch(() => {});
      expect(Api.axiosInstance.get.mock.calls).toHaveLength(2);
    });
    it("rejects if the request fails", () => {
      expect.assertions(1);
      Api.axiosInstance.get.mockRejectedValue();
      return Api.getProducts().catch(() => {
        expect(true).toEqual(true);
      });
    });
    it("rejects if the request returns with no data", () => {
      expect.assertions(1);
      Api.axiosInstance.get.mockResolvedValue({});
      return Api.getProducts().catch(() => {
        expect(true).toEqual(true);
      });
    });
    it("resolves with the data", () => {
      expect.assertions(1);
      Api.axiosInstance.get.mockResolvedValue({
        data: [
          {
            id: "123",
            variations: "[]",
            colors: "[]"
          }
        ]
      });
      return Api.getProducts().then(response => {
        expect(response).toEqual({
          data: [
            {
              id: "123",
              variations: [],
              colors: []
            }
          ]
        });
      });
    });
  });

  describe("#getManufacturers", () => {
    beforeEach(() => {
      Api._getManufacturersCache = [];
    });
    it("makes the relevant request", () => {
      expect.assertions(2);
      Api.getManufacturers().catch(() => {});
      expect(Api.axiosInstance.get.mock.calls[0][0]).toEqual(
        "/manufacturers.php"
      );
      expect(Api.axiosInstance.get.mock.calls[0][1]).toEqual({
        params: { activated: 1 }
      });
    });
    it("does not make identical requests when they have been cached", () => {
      expect.assertions(1);
      Api.getManufacturers().catch(() => {});
      Api.getManufacturers().catch(() => {});
      expect(Api.axiosInstance.get.mock.calls).toHaveLength(1);
    });
    it("does make identical requests when caching is disabled", () => {
      expect.assertions(1);
      Api.getManufacturers(false).catch(() => {});
      Api.getManufacturers(false).catch(() => {});
      expect(Api.axiosInstance.get.mock.calls).toHaveLength(2);
    });
    it("rejects if the request fails", () => {
      expect.assertions(1);
      Api.axiosInstance.get.mockRejectedValue();
      return Api.getManufacturers().catch(() => {
        expect(true).toEqual(true);
      });
    });
    it("rejects if the request returns with no data", () => {
      expect.assertions(1);
      Api.axiosInstance.get.mockResolvedValue({});
      return Api.getManufacturers().catch(() => {
        expect(true).toEqual(true);
      });
    });
    it("resolves with the data", () => {
      expect.assertions(1);
      Api.axiosInstance.get.mockResolvedValue({
        data: [
          {
            id: "123"
          }
        ]
      });
      return Api.getManufacturers().then(response => {
        expect(response).toEqual({
          data: [
            {
              id: "123"
            }
          ]
        });
      });
    });
  });
});
