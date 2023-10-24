import { Construct, IConstruct } from "constructs";
import { App, TerraformStack, Token } from "cdktf";
import { Aurora } from "./.gen/modules/aurora";
import { Vpc } from "./.gen/modules/vpc";
import { RandomProvider } from "./.gen/providers/random/provider";
import { Pet } from "./.gen/providers/random/pet";
import { CdktfAutoConnect, registerConnection } from "./lib/auto-connect";

registerConnection(Aurora, Vpc, (db, vpc) => {
  db.vpcId = vpc.vpcIdOutput;
  db.subnets = Token.asList(vpc.databaseSubnetsOutput);
});

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new RandomProvider(this, "random");

    CdktfAutoConnect.init(this);

    new Vpc(this, "vpc");
    new Aurora(this, "db");

    new MyConstruct(this, "construct");
  }
}

class MyConstruct extends Construct {
  constructor(scope: IConstruct, id: string) {
    super(scope, id);

    new Pet(this, "pet");

    // TODO: allow using the pet instance here instead of the class?
    registerConnection(Pet, Aurora, (pet, db) => {
      pet.prefix = db.clusterIdOutput;
    });

  }
}

const app = new App();
new MyStack(app, "cdktf-auto-connect");
app.synth();
