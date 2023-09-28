import { UserVerifier } from "@multiversx/sdk-wallet";
import { Address, SignableMessage } from "@multiversx/sdk-core";
import { createClient } from "@supabase/supabase-js";
import { createHmac, sign } from "crypto";
import dotenv from "dotenv";

dotenv.config();

const secretSalt = process.env.SECRET_SALT;

const verifyUserSignature = (address, hashed_message, signature) => {
  if (signature.startsWith("0x")) {
    signature = signature.substring(2);
  }
  const verifier = UserVerifier.fromAddress(new Address(address));

  const rawMsg = address + hashed_message + "{}";
  const data = new SignableMessage({
    message: Buffer.from(rawMsg),
  }).serializeForSigning();

  const sign = Buffer.from(signature, "hex");

  return verifier.verify(data, sign);
};

const getAuthenticatedSupabaseClient = async () => {
  const {
    SUPABASE_PROJ_URL,
    SUPABASE_SERVICE_ROLE,
    SUPABASE_EMAIL,
    SUPABASE_PWD,
  } = process.env;

  const supabase = createClient(SUPABASE_PROJ_URL, SUPABASE_SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  await supabase.auth.signInWithPassword({
    email: SUPABASE_EMAIL,
    password: SUPABASE_PWD,
  });
  return supabase;
};

const checkMessageValidity = async (supabaseClient, hashed_message) =>
  (
    await supabaseClient.rpc("check_nonce_string", {
      input_nonce: hashed_message,
    })
  ).data;

const generatePasswordForWallet = (walletAddress) =>
  createHmac("sha256", secretSalt).update(walletAddress).digest("hex");

const getSupabaseApiAccessToken = async (supabase, walletAddress) => {
  const email = `${walletAddress}@refracto.gen.com`;
  const password = generatePasswordForWallet(walletAddress);

  const {
    error,
    data: { session },
  } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const {
      error: signUpError,
      data: { session: signUpSession },
    } = await supabase.auth.signUp({ email, password });

    if (signUpError)
      return {
        success: false,
        error: signUpError,
      };
    return {
      success: true,
      token: signUpSession.access_token,
      refreshToken: signUpSession.refresh_token,
    };
  }
  return {
    success: true,
    token: session.access_token,
    refreshToken: session.refresh_token,
  };
};

const createRequestResponse = (statusCode, body) => {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
};

const createErrorResponse = (message) => {
  return createRequestResponse(401, { reason: message });
};

const createSuccessResponse = (accessToken, refreshToken) => {
  return createRequestResponse(200, { accessToken, refreshToken });
};

export const handler = async (event) => {
  let eventBody = JSON.parse(event.body);
  const { address, hashed_message, signature } = eventBody;
  const supabase = await getAuthenticatedSupabaseClient();

  const isSignatureValid = verifyUserSignature(
    address,
    hashed_message,
    signature
  );
  if (!isSignatureValid) return createErrorResponse("Invalid signature.");

  const isMessageValid = await checkMessageValidity(supabase, hashed_message);
  if (!isMessageValid) return createErrorResponse("Invalid message.");

  const { success, token, refreshToken, error } =
    await getSupabaseApiAccessToken(supabase, address);

  if (!success) {
    return createErrorResponse(JSON.stringify(error));
  }
  return createSuccessResponse(token, refreshToken);
};

// handler({
//   address: "erd1tztluf08g90max7jkr4jtac9w5qv7qacgkhh57q9nz2erq9y2p3sd5njkg", // <-- the wallet address of the user
//   hashed_message: "ee9e2834-bc1f-4707-91ed-29c2405cacfb", // <-- the hashed message to be signed by the user on a successful wallet auth; this is retrieved from supabase through rpc.generate_nonce_string(walletAddress)
//   signature:
//     "d095e638fa505ec40723190d4f7d95c64fcd81e9781e0d34dcb51be24e187b363edb26ca179b2e100be9e9fbe2dbabddadd5d3bf586cce5f707889a5f10c5902", // <-- the signature obtained on a successful login
// }).then((res) => console.log(res));
// handler({
//   resource: "/",
//   path: "/",
//   httpMethod: "POST",
//   headers: null,
//   multiValueHeaders: null,
//   queryStringParameters: null,
//   multiValueQueryStringParameters: null,
//   pathParameters: null,
//   stageVariables: null,
//   requestContext: {
//     resourceId: "8lejtw2bp3",
//     resourcePath: "/",
//     httpMethod: "POST",
//     extendedRequestId: "JZBYmFATjoEFUhA=",
//     requestTime: "09/Aug/2023:11:44:54 +0000",
//     path: "/",
//     accountId: "653210967437",
//     protocol: "HTTP/1.1",
//     stage: "test-invoke-stage",
//     domainPrefix: "testPrefix",
//     requestTimeEpoch: 1691581494740,
//     requestId: "aa4d2b4d-2234-4807-80e6-6326c114c17a",
//     identity: {
//       cognitoIdentityPoolId: null,
//       cognitoIdentityId: null,
//       apiKey: "test-invoke-api-key",
//       principalOrgId: null,
//       cognitoAuthenticationType: null,
//       userArn: "arn:aws:iam::653210967437:root",
//       apiKeyId: "test-invoke-api-key-id",
//       userAgent:
//         "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5.2 Safari/605.1.15",
//       accountId: "653210967437",
//       caller: "653210967437",
//       sourceIp: "test-invoke-source-ip",
//       accessKey: "ASIAZQFTILWG4WQ56VWH",
//       cognitoAuthenticationProvider: null,
//       user: "653210967437",
//     },
//     domainName: "testPrefix.testDomainName",
//     apiId: "19fpyascua",
//   },
//   body: '{\n  "address": "erd1tztluf08g90max7jkr4jtac9w5qv7qacgkhh57q9nz2erq9y2p3sd5njkg",\n  "hashed_message": "5f92f3cf-d35c-4eb2-9548-762cfb9d7a58o",\n  "signature": "ce7c16bb0607dc3876eec704c6647e4b39aa8ed2c48ea5b4a1d703256ff8a3c2dbe65519f005002832ed103af66b4fccd1aca30d55c496832f4cceb999781902"\n}',
//   isBase64Encoded: false,
// }).then(() => console.log("worked"));
