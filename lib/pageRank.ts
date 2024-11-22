// Adapted from https://github.com/alixaxel/pagerank.js/blob/6d348ee5b91663cf1040c5dc1a1263394367f90c/lib/index.js

export default class Graph {
  count: number;
  edges: Record<string, Record<string, number>>;
  nodes: Record<string, { weight: number; outbound: number }>;

  constructor(initialWeights?: Record<string, number>) {
    this.count = 0;
    this.edges = {};
    this.nodes = {};

    // Initialize nodes with weights if provided
    if (initialWeights) {
      forOwn(initialWeights, (key, weight) => {
        if (!isFinite(weight) || weight < 0) {
          throw new Error(`Invalid weight for node "${key}": ${weight}`);
        }
        this.nodes[key] = { weight, outbound: 0 };
        this.count++;
      });
    }
  }

  link(source: string, target: string, weight: number = 1) {
    if (!isFinite(weight) || weight === null) {
      weight = 1;
    }
    if (!this.nodes.hasOwnProperty(source)) {
      this.count++;
      this.nodes[source] = { weight: 0, outbound: 0 };
    }

    this.nodes[source].outbound += weight;

    if (!this.nodes.hasOwnProperty(target)) {
      this.count++;
      this.nodes[target] = { weight: 0, outbound: 0 };
    }

    if (!this.edges.hasOwnProperty(source)) {
      this.edges[source] = {};
    }

    if (!this.edges[source].hasOwnProperty(target)) {
      this.edges[source][target] = 0;
    }

    this.edges[source][target] += weight;
  }

  rank(alpha: number, epsilon: number): Record<string, number> {
    const inverse = 1 / this.count;
    let delta = 1;

    // Normalize edge weights
    forOwn(this.edges, (source) => {
      if (this.nodes[source].outbound > 0) {
        forOwn(this.edges[source], (target) => {
          this.edges[source][target] /= this.nodes[source].outbound;
        });
      }
    });

    // Initialize node weights
    forOwn(this.nodes, (key, value) => {
      if (value.weight === 0) {
        this.nodes[key].weight = inverse;
      }
    });

    // Iteratively calculate ranks
    while (delta > epsilon) {
      let leak = 0;
      const nodes = {};

      forOwn(this.nodes, (key, value) => {
        nodes[key] = value.weight;
        if (value.outbound === 0) {
          leak += value.weight;
        }
        this.nodes[key].weight = 0;
      });

      leak *= alpha;

      forOwn(this.nodes, (source) => {
        forOwn(this.edges[source], (target, weight) => {
          this.nodes[target].weight += alpha * nodes[source] * weight;
        });
        this.nodes[source].weight += (1 - alpha) * inverse + leak * inverse;
      });

      delta = 0;
      forOwn(this.nodes, (key, value) => {
        delta += Math.abs(value.weight - nodes[key]);
      });
    }

    const result = {};
    forOwn(this.nodes, (key) => {
      result[key] = this.nodes[key].weight;
    });
    return result;
  }

  reset() {
    this.count = 0;
    this.edges = {};
    this.nodes = {};
  }
}

function forIn(object: Object, callback) {
  for (var key in object) {
    if (callback(key, object[key]) === false) {
      break;
    }
  }
}

function forOwn(object, callback) {
  forIn(object, function (key, value) {
    if (object.hasOwnProperty(key) === true) {
      return callback(key, value);
    }
  });
}
