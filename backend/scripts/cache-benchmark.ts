#!/usr/bin/env node

import { cache } from '../services/cache.js';
import { logger } from '../services/logger.js';

interface BenchmarkResult {
  operation: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  operationsPerSecond: number;
  memoryUsage: number;
  errors: number;
}

interface BenchmarkSuite {
  name: string;
  results: BenchmarkResult[];
  totalTime: number;
  totalOperations: number;
  averageOperationsPerSecond: number;
}

/**
 * Run a benchmark test for a specific operation
 */
async function benchmarkOperation(
  operation: string,
  iterations: number,
  operationFn: () => void | Promise<void>
): Promise<BenchmarkResult> {
  const startTime = Date.now();
  let errors = 0;

  logger.info(`Starting benchmark: ${operation} (${iterations} iterations)`, {
    service: 'cache-benchmark',
  });

  for (let i = 0; i < iterations; i++) {
    try {
      await operationFn();
    } catch (error) {
      errors++;
      logger.error(`Benchmark error in ${operation}`, {
        iteration: i,
        error: error instanceof Error ? error.message : String(error),
        service: 'cache-benchmark',
      });
    }
  }

  const totalTime = Date.now() - startTime;
  const averageTime = totalTime / iterations;
  const operationsPerSecond = (iterations / totalTime) * 1000;
  const memoryUsage = cache.getStats().memoryUsage || 0;

  const result: BenchmarkResult = {
    operation,
    iterations,
    totalTime,
    averageTime,
    operationsPerSecond,
    memoryUsage,
    errors,
  };

  logger.info(`Benchmark completed: ${operation}`, {
    totalTime: `${totalTime}ms`,
    averageTime: `${averageTime.toFixed(2)}ms`,
    opsPerSecond: `${operationsPerSecond.toFixed(2)}`,
    errors,
    service: 'cache-benchmark',
  });

  return result;
}

/**
 * Run a comprehensive benchmark suite
 */
async function runBenchmarkSuite(): Promise<BenchmarkSuite> {
  const suiteName = 'Cache Performance Benchmark';
  const results: BenchmarkResult[] = [];
  const startTime = Date.now();

  logger.info(`Starting benchmark suite: ${suiteName}`, {
    service: 'cache-benchmark',
  });

  // Clear cache before starting
  cache.clear();

  // Test 1: Single key operations
  results.push(
    await benchmarkOperation('SET (single)', 1000, () => {
      cache.set(`key_${Math.random()}`, {
        data: 'test',
        timestamp: Date.now(),
      });
    })
  );

  results.push(
    await benchmarkOperation('GET (single)', 1000, () => {
      cache.get(`key_${Math.floor(Math.random() * 1000)}`);
    })
  );

  results.push(
    await benchmarkOperation('DELETE (single)', 1000, () => {
      cache.del(`key_${Math.floor(Math.random() * 1000)}`);
    })
  );

  // Test 2: Batch operations
  const batchSize = 100;
  results.push(
    await benchmarkOperation('SET (batch)', 100, () => {
      const items: { [key: string]: unknown } = {};
      for (let i = 0; i < batchSize; i++) {
        items[`batch_key_${Math.random()}`] = {
          data: 'batch_test',
          timestamp: Date.now(),
        };
      }
      cache.mset(items);
    })
  );

  results.push(
    await benchmarkOperation('GET (batch)', 100, () => {
      const keys = Array.from(
        { length: batchSize },
        (_, i) => `batch_key_${i}`
      );
      cache.mget(keys);
    })
  );

  results.push(
    await benchmarkOperation('DELETE (batch)', 100, () => {
      const keys = Array.from(
        { length: batchSize },
        (_, i) => `batch_key_${i}`
      );
      cache.mdel(keys);
    })
  );

  // Test 3: Mixed operations (simulating real-world usage)
  results.push(
    await benchmarkOperation('MIXED (set/get/delete)', 500, () => {
      const key = `mixed_key_${Math.random()}`;
      cache.set(key, { data: 'mixed_test', timestamp: Date.now() });
      cache.get(key);
      cache.del(key);
    })
  );

  // Test 4: Large object operations
  const largeObject = {
    id: Math.random().toString(36),
    data: Array.from({ length: 1000 }, (_, i) => ({
      index: i,
      value: Math.random(),
      timestamp: Date.now(),
    })),
    metadata: {
      created: new Date().toISOString(),
      version: '1.0.0',
      tags: ['large', 'object', 'test'],
    },
  };

  results.push(
    await benchmarkOperation('SET (large object)', 100, () => {
      cache.set(`large_${Math.random()}`, largeObject);
    })
  );

  results.push(
    await benchmarkOperation('GET (large object)', 100, () => {
      cache.get(`large_${Math.floor(Math.random() * 100)}`);
    })
  );

  // Test 5: Concurrent operations (simulated)
  results.push(
    await benchmarkOperation('CONCURRENT (simulated)', 200, async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        Promise.resolve().then(() => {
          const key = `concurrent_${i}_${Math.random()}`;
          cache.set(key, { data: 'concurrent_test', index: i });
          return cache.get(key);
        })
      );
      await Promise.all(promises);
    })
  );

  const totalTime = Date.now() - startTime;
  const totalOperations = results.reduce((sum, r) => sum + r.iterations, 0);
  const averageOperationsPerSecond = (totalOperations / totalTime) * 1000;

  const suite: BenchmarkSuite = {
    name: suiteName,
    results,
    totalTime,
    totalOperations,
    averageOperationsPerSecond,
  };

  return suite;
}

/**
 * Generate benchmark report
 */
function generateReport(suite: BenchmarkSuite): string {
  const report = [
    '='.repeat(80),
    `CACHE PERFORMANCE BENCHMARK REPORT`,
    '='.repeat(80),
    `Suite: ${suite.name}`,
    `Total Time: ${suite.totalTime}ms`,
    `Total Operations: ${suite.totalOperations.toLocaleString()}`,
    `Average Operations/Second: ${suite.averageOperationsPerSecond.toFixed(2)}`,
    '',
    'DETAILED RESULTS:',
    '-'.repeat(80),
  ];

  suite.results.forEach(result => {
    report.push(
      `${result.operation}:`,
      `  Iterations: ${result.iterations.toLocaleString()}`,
      `  Total Time: ${result.totalTime}ms`,
      `  Average Time: ${result.averageTime.toFixed(2)}ms`,
      `  Operations/Second: ${result.operationsPerSecond.toFixed(2)}`,
      `  Memory Usage: ${(result.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
      `  Errors: ${result.errors}`,
      ''
    );
  });

  // Performance recommendations
  report.push('PERFORMANCE RECOMMENDATIONS:', '-'.repeat(80));

  const slowOperations = suite.results.filter(r => r.averageTime > 10);
  if (slowOperations.length > 0) {
    report.push('⚠️  Slow operations detected:');
    slowOperations.forEach(op => {
      report.push(
        `  - ${op.operation}: ${op.averageTime.toFixed(2)}ms average`
      );
    });
    report.push('');
  }

  const highErrorOperations = suite.results.filter(r => r.errors > 0);
  if (highErrorOperations.length > 0) {
    report.push('❌ Operations with errors:');
    highErrorOperations.forEach(op => {
      report.push(`  - ${op.operation}: ${op.errors} errors`);
    });
    report.push('');
  }

  const fastOperations = suite.results.filter(r => r.averageTime < 1);
  if (fastOperations.length > 0) {
    report.push('✅ Fast operations:');
    fastOperations.forEach(op => {
      report.push(
        `  - ${op.operation}: ${op.averageTime.toFixed(2)}ms average`
      );
    });
    report.push('');
  }

  report.push(
    'GENERAL RECOMMENDATIONS:',
    '-'.repeat(80),
    '• Use batch operations for multiple items to improve performance',
    '• Consider TTL settings to manage memory usage',
    '• Monitor cache hit rates and adjust cache size accordingly',
    '• Use appropriate key naming conventions for better organization',
    '• Consider cache warming strategies for frequently accessed data',
    '',
    '='.repeat(80)
  );

  return report.join('\n');
}

/**
 * Main benchmark execution
 */
async function main() {
  try {
    logger.info('Starting cache performance benchmark', {
      service: 'cache-benchmark',
    });

    const suite = await runBenchmarkSuite();
    const report = generateReport(suite);

    console.log(report);

    // Save report to file
    const fs = await import('fs/promises');
    const reportPath = `cache-benchmark-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    await fs.writeFile(reportPath, report);

    logger.info(`Benchmark completed. Report saved to: ${reportPath}`, {
      service: 'cache-benchmark',
    });

    // Clean up
    cache.clear();
  } catch (error) {
    logger.error('Benchmark failed', {
      error: error instanceof Error ? error.message : String(error),
      service: 'cache-benchmark',
    });
    process.exit(1);
  }
}

// Run benchmark if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runBenchmarkSuite, generateReport, benchmarkOperation };
