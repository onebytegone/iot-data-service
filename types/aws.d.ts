interface APIGatewayAuthorizerEvent {
   type: string;
   methodArn: string;
   authorizationToken: string;
}

interface APIGatewayResource {
   regionID: string;
   accountID: string;
   apiID: string;
   stage: string;
   method: string;
   resourcePath: string;
}
