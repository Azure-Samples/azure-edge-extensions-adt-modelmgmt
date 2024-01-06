import { expect } from 'chai';
import { Model } from '../src/models';
import ModelServiceSteps from './ModelServiceSteps';

export default class DecommissionModelSteps extends ModelServiceSteps {
  arrangeDecommissionModelRejects(): void {
    this.ctx.digitalTwinsClient.decomissionModel.rejects();
  }

  assertModelsDecommissionedInOrder(modelsToDecommission: Model[]): void {
    const actualDecommissionedIdsOrder = this.ctx.digitalTwinsClient.decomissionModel.args.flat();
    expect(actualDecommissionedIdsOrder.length, 'should call decommission with every provided id')
      .to.equal(modelsToDecommission.length);
    const actualModelOrder = actualDecommissionedIdsOrder
      .map((id) => modelsToDecommission.find((model) => model['@id'] === id));

    const uploadedIdList = [];
    actualModelOrder.forEach((model) => {
      if (model.extends) {
        expect(!uploadedIdList.includes(model.extends),
          `model: ${model['@id']}, which extends should be decommissioned before its parent`)
          .to.be.true;
      }
      uploadedIdList.push(model['@id']);
    });
  }
}
