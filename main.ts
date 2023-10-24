import { Construct } from "constructs";
import { App, TerraformStack, Token } from "cdktf";
import { Aurora } from "./.gen/modules/aurora";
import { Vpc } from "./.gen/modules/vpc";
import { CdktfAutoConnect, registerConnection } from "./lib/auto-connect";

registerConnection(Aurora, Vpc, (db, vpc) => {
  db.vpcId = vpc.vpcIdOutput;
  db.subnets = Token.asList(vpc.databaseSubnetsOutput);
});

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    CdktfAutoConnect.init(this);

    new Vpc(this, "vpc");
    new Aurora(this, "db");

  }
}

const app = new App();
new MyStack(app, "cdktf-auto-connect");
app.synth();
