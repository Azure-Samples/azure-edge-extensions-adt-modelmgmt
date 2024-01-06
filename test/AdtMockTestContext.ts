import { DigitalTwinsClient } from '@azure/digital-twins-core';
import sinon from 'sinon';
import ModelService from '../src';

export default class AdtMockTestContext {
  public readonly digitalTwinsClient: sinon.SinonStubbedInstance<DigitalTwinsClient>;

  public readonly modelService: ModelService;

  constructor() {
    sinon.restore();
    this.digitalTwinsClient = sinon.createStubInstance(DigitalTwinsClient);
    this.modelService = new ModelService(this.digitalTwinsClient);
  }
}
