import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import assert from "assert";
import supertest from "supertest";
import sinon from "sinon";
import { errorHandler, simpleHttpRequest } from "../helpers/index.js";

let app;

describe("helpers", function () {
  beforeEach(function () {
    app = express();
    app.use(bodyParser.json());
  });

  describe("#errorHandler", function () {
    it("should return error with correct message and status", function (done) {
      const error = new Error("Something went wrong");
      error.status = 501;

      app.use(function (_req, _res) {
        errorHandler(error, _req, _res);
      });

      supertest(app)
        .get("/")
        .expect(501)
        .end(function (err, res) {
          assert.strictEqual(res.body.message, "Something went wrong");
          done(err);
        });
    });
  });

  describe("#simpleHttpRequest", function () {
    afterEach(function () {
      // Restore the stub after each test to ensure a clean slate
      sinon.restore();
    });

    it("performs a GET request successfully", async function () {
      const url = "http://example.com";
      sinon.stub(axios, "get").resolves({ data: "success" });

      const res = {
        statusCode: null,
        data: null,
        writeHead(status) {
          this.statusCode = status;
        },
        write(data) {
          this.data = data;
        },
        end() {},
      };

      const next = sinon.spy();

      await simpleHttpRequest(url, res, next);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data, JSON.stringify("success"));
      assert.strictEqual(next.called, false);
    });

    it("handles a failed GET request", async function () {
      const url = "http://example.com";
      const next = sinon.spy();
      sinon.stub(axios, "get").rejects(new Error("Request failed"));

      await simpleHttpRequest(url, {}, next);
      assert.strictEqual(next.calledOnce, true);
      assert.strictEqual(next.firstCall.args[0].message, "Request failed");
    });
  });
});
