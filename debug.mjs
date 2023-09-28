import { handler } from './index.mjs';

handler({
  resource: '/',
  path: '/',
  httpMethod: 'POST',
  headers: null,
  multiValueHeaders: null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  pathParameters: null,
  stageVariables: null,
  requestContext: {
    resourceId: '8lejtw2bp3',
    resourcePath: '/',
    httpMethod: 'POST',
    extendedRequestId: 'JZBYmFATjoEFUhA=',
    requestTime: '09/Aug/2023:11:44:54 +0000',
    path: '/',
    accountId: '653210967437',
    protocol: 'HTTP/1.1',
    stage: 'test-invoke-stage',
    domainPrefix: 'testPrefix',
    requestTimeEpoch: 1691581494740,
    requestId: 'aa4d2b4d-2234-4807-80e6-6326c114c17a',
    identity: {
      cognitoIdentityPoolId: null,
      cognitoIdentityId: null,
      apiKey: 'test-invoke-api-key',
      principalOrgId: null,
      cognitoAuthenticationType: null,
      userArn: 'arn:aws:iam::653210967437:root',
      apiKeyId: 'test-invoke-api-key-id',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5.2 Safari/605.1.15',
      accountId: '653210967437',
      caller: '653210967437',
      sourceIp: 'test-invoke-source-ip',
      accessKey: 'ASIAZQFTILWG4WQ56VWH',
      cognitoAuthenticationProvider: null,
      user: '653210967437'
    },
    domainName: 'testPrefix.testDomainName',
    apiId: '19fpyascua'
  },
  body: '{"address":"erd1j43ssgjr8x9m0s7zz0xhn7qdgssdetm86jc6a2dzsegs74fmyl5ssv44c4","hashed_message":"8513f466-870a-492e-b0fc-4eb748c652f9","signature":"4e22b073208dcf8654ddcfdec4a84db4f4fac40bde06742c83402b00f41d9579c92def6f57b4f956ed33283910ec6a9d771467916a92a3150de6baf4bf3afd01"}',
  isBase64Encoded: false
}).then((res) => console.log('Process ran successfully', res));
