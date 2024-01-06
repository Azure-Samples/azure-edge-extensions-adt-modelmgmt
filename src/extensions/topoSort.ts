/* eslint-disable
  no-extend-native,
  @typescript-eslint/no-unused-vars,
  no-unused-vars,
  no-plusplus,
  no-await-in-loop
*/
import { DirectedAcyclicGraph } from 'typescript-graph';
import { Model, Component } from '../models';

export { };

declare global {
  interface Array<T> {
    topoSort(this: Model[]): Model[];
  }
}

function topoSort(): Model[] {
  const graph = new DirectedAcyclicGraph<Model>((m) => m['@id']);
  const edges: { source: string, dependsOn: string }[] = [];
  this.forEach((model: Model) => {
    graph.upsert(model);
    if (model.extends) {
      if (typeof model.extends === 'string') {
        edges.push({ source: model['@id'], dependsOn: model.extends });
      } else {
        model.extends.forEach((extend) => {
          edges.push({ source: model['@id'], dependsOn: extend });
        });
      }
    }
    if (model.contents) {
      model.contents
        .filter((e) => e['@type'] === 'Component')
        .forEach((component: Component) => {
          edges.push({ source: model['@id'], dependsOn: component.schema });
        });
        //also add edges for relationships 
        model.contents
        .filter((e) => e['@type'] === 'Relationship')
        .forEach((relationship:any) => {
          //edges.push({ source: model['@id'], dependsOn: relationship.target });
        });
    }
  });
  edges.forEach((edge) => {
    graph.addEdge(edge.source, edge.dependsOn)
  });
  return graph.topologicallySortedNodes();
}

Array.prototype.topoSort = topoSort;
