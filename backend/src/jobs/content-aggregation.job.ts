import logger from '../utils/logger';
import cron from 'node-cron';
import { aggregatorService } from '../services/aggregation/aggregator.service';

export class ContentAggregationJob {
  private task: cron.ScheduledTask | null = null;
  private isRunning: boolean = false;

  /**
   * Start the content aggregation job
   * Runs every 6 hours by default
   */
  start(schedule: string = '0 */6 * * *') {
    if (this.task) {
      logger.info('⚠️  Content aggregation job is already running');
      return;
    }

    logger.info(`📅 Scheduling content aggregation job: ${schedule}`);
    logger.info('   Schedule: Every 6 hours');

    this.task = cron.schedule(schedule, async () => {
      if (this.isRunning) {
        logger.info('⚠️  Content aggregation already in progress, skipping...');
        return;
      }

      await this.run();
    });

    logger.info('✅ Content aggregation job scheduled');
  }

  /**
   * Stop the job
   */
  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      logger.info('🛑 Content aggregation job stopped');
    }
  }

  /**
   * Run the aggregation job manually
   */
  async run() {
    this.isRunning = true;

    logger.info('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('🔄 Starting content aggregation job');
    logger.info(`⏰ Time: ${new Date().toISOString()}`);
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      // Check sources health first
      logger.info('🏥 Checking sources health...\n');
      const health = await aggregatorService.checkSourcesHealth();

      const availableSources = Object.values(health).filter(h => h).length;
      const totalSources = Object.keys(health).length;

      logger.info(`\n✅ ${availableSources}/${totalSources} sources available\n`);

      if (availableSources === 0) {
        logger.info('❌ No sources available, skipping aggregation');
        return;
      }

      // Run aggregation for all categories
      const results = await aggregatorService.aggregateAll();

      // Calculate totals
      const totals = results.reduce(
        (acc, result) => ({
          fetched: acc.fetched + result.fetched,
          saved: acc.saved + result.saved,
          skipped: acc.skipped + result.skipped,
          errors: acc.errors + result.errors,
        }),
        { fetched: 0, saved: 0, skipped: 0, errors: 0 }
      );

      logger.info('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info('📊 Aggregation Summary');
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info(`Total Fetched: ${totals.fetched}`);
      logger.info(`Total Saved:   ${totals.saved}`);
      logger.info(`Total Skipped: ${totals.skipped}`);
      logger.info(`Total Errors:  ${totals.errors}`);
      logger.info(`Success Rate:  ${totals.fetched > 0 ? ((totals.saved / totals.fetched) * 100).toFixed(1) : 0}%`);
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      logger.info(`✅ Content aggregation job completed at ${new Date().toISOString()}\n`);
    } catch (error) {
      logger.error('\n❌ Content aggregation job failed:', error);
      logger.error('Stack trace:', error.stack);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get job status
   */
  getStatus() {
    return {
      isScheduled: this.task !== null,
      isRunning: this.isRunning,
    };
  }
}

export const contentAggregationJob = new ContentAggregationJob();

// Export a function to initialize the job
export const initializeContentAggregation = (autoStart: boolean = true) => {
  if (autoStart) {
    // Run immediately on startup (useful for testing)
    logger.info('🚀 Running initial content aggregation...');
    contentAggregationJob.run();

    // Then schedule for every 6 hours
    contentAggregationJob.start();
  }

  return contentAggregationJob;
};
