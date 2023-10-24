import {
  Aspects,
  IAspect,
  TerraformModule,
  TerraformStack,
} from "cdktf";
import { Construct, IConstruct } from "constructs";

type Constructor<T> = new (...args: any[]) => T;

export class CdktfAutoConnect implements IAspect {
  private constructor(private scope: Construct) {}

  public static init(scope: Construct) {
    Aspects.of(scope).add(new CdktfAutoConnect(scope));
  }

  visit(node: IConstruct): void {
    if (node instanceof TerraformModule && connections[node.source]) {
      const connection = connections[node.source];
      const a = node;
      const b = this.find(connection[0]);
      if (b) {
        connection[1](a, b);
      }
    }
  }

  private find(
    terraformModuleSource: TerraformModule["source"]
  ): TerraformModule | undefined {
    return TerraformStack.of(this.scope)
      .node.findAll()
      .find(
        (c) =>
          c instanceof TerraformModule && c.source === terraformModuleSource
      ) as TerraformModule | undefined;
  }
}

type ConnectFn<F extends TerraformModule, T extends TerraformModule> = (
  a: F,
  b: T
) => void;

const connections: Record<
  TerraformModule["source"],
  [TerraformModule["source"], ConnectFn<TerraformModule, TerraformModule>]
> = {};

export function registerConnection<
  F extends TerraformModule,
  T extends TerraformModule
>(from: Constructor<F>, to: Constructor<T>, connect: ConnectFn<F, T>) {
  connections[new from().source] = [new to().source, connect as any];
}
