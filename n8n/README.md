# n8n Workflows for Content Aggregation

This directory contains n8n workflows for automated content aggregation from multiple sources.

## Overview

The platform uses n8n to automatically fetch, process, and store educational content from:

1. **YouTube** - Educational videos from channels and search queries
2. **arXiv** - Research papers across multiple disciplines
3. **RSS Feeds** - Blog posts and articles from various sources

## Workflows

### 1. YouTube Content Aggregator
**File**: `workflows/youtube-content-aggregator.json`

**Schedule**: Daily at 6:00 AM

**Process**:
1. Fetch active YouTube sources from database
2. Search YouTube API for recent videos
3. Get detailed video metadata (views, likes, duration)
4. Calculate quality score based on engagement
5. Check for duplicates
6. Insert new content into database

**Quality Scoring**:
```javascript
qualityScore = 0.3 + (engagementRate * 100)
where engagementRate = (likes + comments) / views
```

**Configuration Options**:
- `channel_id` - YouTube channel ID
- `search_query` - Search keywords
- `max_videos` - Maximum videos per source (default: 10)

### 2. arXiv Research Paper Aggregator
**File**: `workflows/arxiv-paper-aggregator.json`

**Schedule**: Daily at 7:00 AM

**Process**:
1. Fetch active arXiv sources from database
2. Query arXiv API with search parameters
3. Parse XML response
4. Extract paper metadata (title, authors, abstract)
5. Calculate quality score
6. Check for duplicates
7. Insert new papers into database

**Quality Scoring**:
```javascript
Base score: 0.7 (research papers are high quality)
+ 0.1 if abstract length is 150-500 words
+ 0.1 if published within last 7 days
+ 0.05 if cross-disciplinary (multiple categories)
```

**Configuration Options**:
- `search_query` - arXiv search query (e.g., `cat:cs.AI`)
- `categories` - arXiv categories to filter
- `max_results` - Maximum papers per query (default: 10)

### 3. RSS Feed Aggregator
**File**: `workflows/rss-feed-aggregator.json`

**Schedule**: Every 6 hours

**Process**:
1. Fetch active RSS feed sources from database
2. Read and parse RSS/Atom feeds
3. Filter items from last 24 hours
4. Extract article metadata
5. Estimate word count and reading time
6. Calculate quality score
7. Check for duplicates (by URL)
8. Insert new articles into database

**Quality Scoring**:
```javascript
Base score: 0.6
+ 0.2 if word count between 500-2000
+ 0.1 if author is known
+ 0.05 if has thumbnail
+ 0.05 if has categories
```

**Configuration Options**:
- `feed_url` - RSS/Atom feed URL
- `extract_full_text` - Attempt to fetch full article
- `keywords` - Filter by keywords

## Setup Instructions

### Prerequisites

1. **n8n Installation**
   ```bash
   npm install n8n -g
   ```

2. **Database Access**
   - PostgreSQL connection configured
   - Backend API accessible

3. **API Keys**
   - YouTube Data API v3 key
   - Backend API authentication token

### Installation

1. **Start n8n**
   ```bash
   n8n start
   ```

   Access at: http://localhost:5678

2. **Configure Credentials**

   Navigate to **Settings > Credentials** and add:

   #### PostgreSQL
   - **Name**: PostgreSQL
   - **Host**: your-database-host
   - **Database**: content_aggregator
   - **User**: n8n_user
   - **Password**: your-password
   - **Port**: 5432

   #### YouTube API
   - **Name**: YouTube API
   - **API Key**: your-youtube-api-key
   - Get key at: https://console.cloud.google.com/

   #### Backend API Auth (HTTP Header Auth)
   - **Name**: Backend API Auth
   - **Name**: Authorization
   - **Value**: Bearer your-backend-api-token

3. **Import Workflows**

   For each workflow:
   1. Go to **Workflows** > **Import from File**
   2. Select the JSON file
   3. Click **Import**
   4. Activate the workflow (toggle switch in top-right)

4. **Set Environment Variables**

   In n8n settings, add:
   ```
   BACKEND_API_URL=http://localhost:4000
   ```

### Testing Workflows

1. **Manual Execution**
   - Open any workflow
   - Click **Execute Workflow** button
   - Check execution log for errors

2. **Test Individual Nodes**
   - Click on any node
   - Click **Execute Node**
   - View output in the panel

3. **Monitor Executions**
   - Go to **Executions** tab
   - View history of all runs
   - Check for failures

## Content Source Configuration

### Adding YouTube Channels

```sql
INSERT INTO content_sources (
    name, source_type, category_id, source_url,
    fetch_frequency, is_active, config
) VALUES (
    'Veritasium',
    'youtube_channel',
    (SELECT id FROM categories WHERE slug = 'science'),
    'https://youtube.com/c/veritasium',
    'daily',
    TRUE,
    '{"channel_id": "UCHnyfMqiRRG1u-2MsSQLbXA", "max_videos": 5}'
);
```

### Adding arXiv Searches

```sql
INSERT INTO content_sources (
    name, source_type, category_id, source_url,
    fetch_frequency, is_active, config
) VALUES (
    'AI Research',
    'api',
    (SELECT id FROM categories WHERE slug = 'software'),
    'http://export.arxiv.org/api/query',
    'daily',
    TRUE,
    '{"search_query": "cat:cs.AI", "max_results": 10}'
);
```

### Adding RSS Feeds

```sql
INSERT INTO content_sources (
    name, source_type, category_id, source_url,
    fetch_frequency, is_active, config
) VALUES (
    'Tech Crunch',
    'rss_feed',
    (SELECT id FROM categories WHERE slug = 'software'),
    'https://techcrunch.com/feed/',
    'hourly',
    TRUE,
    '{"keywords": ["AI", "machine learning"]}'
);
```

## Troubleshooting

### Common Issues

1. **YouTube API Quota Exceeded**
   - YouTube API has 10,000 units/day limit
   - Each search = 100 units
   - Each video detail = 1 unit
   - **Solution**: Reduce `max_videos` or frequency

2. **Database Connection Fails**
   - Check PostgreSQL credentials
   - Verify network access
   - Check firewall rules
   - **Solution**: Test connection in n8n credentials

3. **Content Duplicates**
   - Workflow should check for duplicates
   - Uses `external_id` + `source` or `url`
   - **Solution**: Verify deduplication logic in workflows

4. **arXiv XML Parsing Errors**
   - arXiv API can return malformed XML
   - **Solution**: Add error handling in Parse XML node

5. **RSS Feed Timeouts**
   - Some feeds are slow to respond
   - **Solution**: Increase timeout in HTTP Request node settings

### Debugging

1. **Enable Debug Mode**
   - Set environment: `N8N_LOG_LEVEL=debug`
   - Restart n8n

2. **Check Logs**
   ```bash
   tail -f ~/.n8n/logs/n8n.log
   ```

3. **Test API Endpoints**
   - Use Postman or curl to test backend API
   - Verify authentication tokens
   - Check request/response formats

## Performance Optimization

### Rate Limiting

1. **YouTube API**
   - Implement exponential backoff
   - Cache channel IDs
   - Batch video detail requests

2. **arXiv API**
   - Respect 3 second delay between requests
   - Use pagination wisely

3. **RSS Feeds**
   - Check `If-Modified-Since` headers
   - Cache feed contents
   - Skip unchanged feeds

### Scaling

1. **Multiple n8n Instances**
   - Use n8n in queue mode
   - Share Redis for coordination
   - Separate workflows across instances

2. **Database Optimization**
   - Index `external_id` + `source`
   - Index `url` for RSS content
   - Partition `content` table by date

3. **Parallel Processing**
   - Use n8n's built-in parallel execution
   - Process multiple sources concurrently
   - Batch database inserts

## Monitoring

### Key Metrics

1. **Success Rate**
   - % of successful workflow executions
   - Track in n8n execution history

2. **Content Volume**
   - Items fetched per day
   - Items inserted per day
   - Duplicate rate

3. **Processing Time**
   - Average workflow duration
   - Slowest nodes
   - API response times

### Alerts

Set up n8n error workflows:

1. **On Workflow Failure**
   - Send Slack/email notification
   - Log to monitoring service
   - Create support ticket

2. **On Low Content Volume**
   - Alert if < 10 items/day
   - Check source availability
   - Review API quotas

## Advanced Configuration

### Custom Transforms

Add custom JavaScript in Function nodes:

```javascript
// Example: Advanced quality scoring
const calculateAdvancedQuality = (item) => {
  let score = 0.5;

  // Readability score
  const flesch = calculateFleschScore(item.description);
  score += (flesch / 100) * 0.2;

  // Sentiment analysis
  const sentiment = analyzeSentiment(item.description);
  score += sentiment.positive * 0.1;

  // Author authority
  if (authorIsVerified(item.author)) {
    score += 0.15;
  }

  return Math.min(score, 1.0);
};
```

### Webhook Integration

Add webhook triggers for real-time updates:

```javascript
// In n8n workflow, add Webhook node
{
  "path": "content-update",
  "method": "POST",
  "responseMode": "onReceived"
}

// From backend, trigger workflow:
fetch('https://n8n.yourdomain.com/webhook/content-update', {
  method: 'POST',
  body: JSON.stringify({
    source: 'youtube',
    channelId: 'UCxxx',
    force: true
  })
});
```

## Security Best Practices

1. **API Keys**
   - Store in n8n credentials, never in workflows
   - Rotate keys regularly
   - Use environment-specific keys

2. **Database Access**
   - Use read-only user for queries
   - Use separate user with insert-only for content
   - Never expose passwords in workflows

3. **Backend Authentication**
   - Use API tokens with short expiration
   - Implement rate limiting
   - Log all API calls

4. **Network Security**
   - Run n8n behind firewall
   - Use HTTPS for all connections
   - Whitelist IP addresses

## Maintenance

### Daily

- Check execution logs for errors
- Monitor API quota usage
- Verify content is being added

### Weekly

- Review content quality scores
- Update source configurations
- Test backup/restore procedures

### Monthly

- Audit workflow performance
- Update API credentials
- Review and optimize workflows
- Clean up old executions

## Resources

- [n8n Documentation](https://docs.n8n.io/)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [arXiv API](https://arxiv.org/help/api)
- [RSS 2.0 Specification](https://www.rssboard.org/rss-specification)

## Support

For issues or questions:
1. Check n8n execution logs
2. Review this documentation
3. Check backend API logs
4. Create issue in project repository
