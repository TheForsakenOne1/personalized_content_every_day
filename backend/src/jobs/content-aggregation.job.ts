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
      console.log('⚠️  Content aggregation job is already running');
      return;
    }

    console.log(`📅 Scheduling content aggregation job: ${schedule}`);
    console.log('   Schedule: Every 6 hours');

    this.task = cron.schedule(schedule, async () => {
      if (this.isRunning) {
        console.log('⚠️  Content aggregation already in progress, skipping...');
        return;
      }

      await this.run();
    });

    console.log('✅ Content aggregation job scheduled');
  }

  /**
   * Stop the job
   */
  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log('🛑 Content aggregation job stopped');
    }
  }

  /**
   * Run the aggregation job manually
   */
  async run() {
    this.isRunning = true;

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 Starting content aggregation job');
    console.log(`⏰ Time: ${new Date().toISOString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      // Check sources health first
      console.log('🏥 Checking sources health...\n');
      const health = await aggregatorService.checkSourcesHealth();

      const availableSources = Object.values(health).filter(h => h).length;
      const totalSources = Object.keys(health).length;

      console.log(`\n✅ ${availableSources}/${totalSources} sources available\n`);

      if (availableSources === 0) {
        console.log('❌ No sources available, skipping aggregation');
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

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 Aggregation Summary');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Total Fetched: ${totals.fetched}`);
      console.log(`Total Saved:   ${totals.saved}`);
      console.log(`Total Skipped: ${totals.skipped}`);
      console.log(`Total Errors:  ${totals.errors}`);
      console.log(`Success Rate:  ${totals.fetched > 0 ? ((totals.saved / totals.fetched) * 100).toFixed(1) : 0}%`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      console.log(`✅ Content aggregation job completed at ${new Date().toISOString()}\n`);
    } catch (error) {
      console.error('\n❌ Content aggregation job failed:', error);
      console.error('Stack trace:', error.stack);
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
    console.log('🚀 Running initial content aggregation...');
    contentAggregationJob.run();

    // Then schedule for every 6 hours
    contentAggregationJob.start();
  }

  return contentAggregationJob;
};
