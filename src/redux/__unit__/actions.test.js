import * as Actions from "../actions";
import KitePaintApi from "../../api/KitePaintApi";
jest.mock("../../api/KitePaintApi");

function dispatchAsyncAction(action, params = []) {
  action(...params)(() => {});
}

describe("Redux actions", () => {
  describe("CHECK_LOGIN", () => {
    beforeEach(() => {
      KitePaintApi.checkLoginStatus.mockResolvedValue();
    });
    it("should call KitePaintApi.checkLoginStatus", () => {
      expect.assertions(1);
      dispatchAsyncAction(Actions.CHECK_LOGIN);
      expect(KitePaintApi.checkLoginStatus.mock.calls).toHaveLength(1);
    });
  });
  describe("LOG_IN", () => {
    beforeEach(() => {
      KitePaintApi.logIn.mockResolvedValue();
    });
    it("should call KitePaintApi.logIn with the params", () => {
      expect.assertions(2);
      dispatchAsyncAction(Actions.LOG_IN, ["frank", "securepass"]);
      expect(KitePaintApi.logIn.mock.calls).toHaveLength(1);
      expect(KitePaintApi.logIn.mock.calls[0]).toEqual(["frank", "securepass"]);
    });
  });
  describe("LOG_OUT", () => {
    beforeEach(() => {
      KitePaintApi.logOut.mockResolvedValue();
    });
    it("should call KitePaintApi.logOut", () => {
      expect.assertions(1);
      dispatchAsyncAction(Actions.LOG_OUT);
      expect(KitePaintApi.logOut.mock.calls).toHaveLength(1);
    });
  });
  describe("REGISTER", () => {
    beforeEach(() => {
      KitePaintApi.register.mockResolvedValue();
    });
    it("should call KitePaintApi.register with the params", () => {
      expect.assertions(2);
      dispatchAsyncAction(Actions.REGISTER, [{ foo: "bar" }]);
      expect(KitePaintApi.register.mock.calls).toHaveLength(1);
      expect(KitePaintApi.register.mock.calls[0][0]).toEqual({ foo: "bar" });
    });
  });
  describe("RESET_PASSWORD", () => {
    beforeEach(() => {
      KitePaintApi.resetPassword.mockResolvedValue();
    });
    it("should call KitePaintApi.resetPassword with the params", () => {
      expect.assertions(2);
      dispatchAsyncAction(Actions.RESET_PASSWORD, ["frank", "frank@yahoo.com"]);
      expect(KitePaintApi.resetPassword.mock.calls).toHaveLength(1);
      expect(KitePaintApi.resetPassword.mock.calls[0]).toEqual([
        "frank",
        "frank@yahoo.com"
      ]);
    });
  });
  describe("SET_RECOGNIZED_USER", () => {
    beforeEach(() => {
      localStorage.removeItem("isRecognizedUser");
    });
    afterEach(() => {
      localStorage.removeItem("isRecognizedUser");
    });
    it("should set isRecognizedUser in localStorage", () => {
      expect.assertions(1);
      Actions.SET_RECOGNIZED_USER([true]);
      expect(localStorage.getItem("isRecognizedUser")).toEqual("true");
    });
  });
});