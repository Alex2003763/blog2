import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';

// A function to create and configure the DynamoDB client.
// This helps to ensure that all necessary environment variables are present before initialization.
function createDynamoDBClient() {
  const region = process.env.NETLIFY_AWS_REGION;
  const accessKeyId = process.env.NETLIFY_AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.NETLIFY_AWS_SECRET_ACCESS_KEY;

  // Check for the presence of required AWS credentials and region.
  // If any are missing, throw a specific error to aid in debugging.
  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Missing AWS configuration. Ensure NETLIFY_AWS_REGION, NETLIFY_AWS_ACCESS_KEY_ID, and NETLIFY_AWS_SECRET_ACCESS_KEY are set in your environment variables.'
    );
  }

  return new DynamoDBClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

const client = createDynamoDBClient();
const dynamodb = DynamoDBDocumentClient.from(client);

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  views?: number;
}

export class DynamoDBService {
  private tableName: string;

  constructor() {
    // Also check for DYNAMODB_TABLE_NAME, which is crucial for the service to work.
    if (!process.env.DYNAMODB_TABLE_NAME) {
        throw new Error('Missing DYNAMODB_TABLE_NAME environment variable.');
    }
    this.tableName = process.env.DYNAMODB_TABLE_NAME;
  }

  async getAllPosts(options?: {
    status?: 'published' | 'draft' | 'all';
    searchTerm?: string;
  }): Promise<BlogPost[]> {
    const { status = 'all', searchTerm } = options || {};

    const filterExpressions: string[] = [];
    const expressionAttributeValues: { [key:string]: any } = {};
    const expressionAttributeNames: { [key:string]: any } = {};

    if (status === 'published') {
      filterExpressions.push('published = :published');
      expressionAttributeValues[':published'] = true;
    } else if (status === 'draft') {
      filterExpressions.push('published = :published');
      expressionAttributeValues[':published'] = false;
    }

    if (searchTerm) {
      filterExpressions.push('(contains(#title, :searchTerm) OR contains(#content, :searchTerm))');
      expressionAttributeValues[':searchTerm'] = searchTerm.toLowerCase();
      expressionAttributeNames['#title'] = 'title';
      expressionAttributeNames['#content'] = 'content';
    }

    const params: any = {
      TableName: this.tableName,
    };

    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(' AND ');
      params.ExpressionAttributeValues = expressionAttributeValues;
    }
    
    if (Object.keys(expressionAttributeNames).length > 0) {
        params.ExpressionAttributeNames = expressionAttributeNames;
    }

    try {
      // Handle DynamoDB's 1MB scan limit with pagination
      let allItems: BlogPost[] = [];
      let lastEvaluatedKey: Record<string, any> | undefined = undefined;

      do {
        const scanParams: any = { ...params, ExclusiveStartKey: lastEvaluatedKey };
        const result: any = await dynamodb.send(new ScanCommand(scanParams));
        if (result.Items) {
          allItems = allItems.concat(result.Items as BlogPost[]);
        }
        lastEvaluatedKey = result.LastEvaluatedKey;
      } while (lastEvaluatedKey);

      return allItems;
    } catch (error) {
      console.error('Error fetching all posts with filters:', error);
      throw error;
    }
  }

  async getPublishedPosts(): Promise<BlogPost[]> {
    console.log("Fetching published posts from table:", this.tableName);
    try {
      const params = {
        TableName: this.tableName,
        FilterExpression: 'published = :published',
        ExpressionAttributeValues: {
          ':published': true,
        },
      };
      console.log("Scan params:", JSON.stringify(params, null, 2));
      const result = await dynamodb.send(new ScanCommand(params));
      console.log(`Found ${result.Items?.length || 0} published posts.`);
      return (result.Items as BlogPost[]) || [];
    } catch (error: any) {
      console.error('Error fetching published posts:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      if (error.$metadata) {
        console.error('Error metadata:', error.$metadata);
      }
      throw error;
    }
  }

  async getPostById(id: string): Promise<BlogPost | null> {
    try {
      const params = {
        TableName: this.tableName,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
          ':id': id,
        },
      };

      const result = await dynamodb.send(new QueryCommand(params));
      
      if (result.Items && result.Items.length > 0) {
        return result.Items[0] as BlogPost;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching post by ID:', error);
      throw error;
    }
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const params = {
        TableName: this.tableName,
        FilterExpression: 'slug = :slug',
        ExpressionAttributeValues: {
          ':slug': slug,
        },
      };

      const result = await dynamodb.send(new ScanCommand(params));
      const items = result.Items as BlogPost[];
      
      if (items && items.length > 0) {
        const post = items.find(p => p.published);
        return post || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching post by slug:', error);
      throw error;
    }
  }

  async searchPosts(query: string): Promise<BlogPost[]> {
    console.log(`Searching for published posts with query: "${query}"`);
    try {
      // For public search, we only search published posts.
      // This reuses the more powerful getAllPosts method.
      return await this.getAllPosts({
        status: 'published',
        searchTerm: query,
      });
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  }

  async createPost(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost> {
    try {
      const now = new Date().toISOString();
      
      const newPost: BlogPost = {
        id: uuidv4(),
        ...post,
        created_at: now,
        updated_at: now,
        views: 0,
      };

      const params = {
        TableName: this.tableName,
        Item: newPost,
      };

      await dynamodb.send(new PutCommand(params));
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async updatePost(id: string, created_at: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    try {
      const now = new Date().toISOString();
      
      const params = {
        TableName: this.tableName,
        Key: { id, created_at },
        UpdateExpression: 'SET updated_at = :updated_at',
        ExpressionAttributeValues: {
          ':updated_at': now,
        },
        ReturnValues: 'ALL_NEW' as const,
      };

      // 動態構建更新表達式
      const updateExpressions: string[] = ['updated_at = :updated_at'];
      const expressionAttributeValues: any = { ':updated_at': now };

      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
          updateExpressions.push(`${key} = :${key}`);
          expressionAttributeValues[`:${key}`] = value;
        }
      });

      params.UpdateExpression = `SET ${updateExpressions.join(', ')}`;
      params.ExpressionAttributeValues = expressionAttributeValues;

      const result = await dynamodb.send(new UpdateCommand(params));
      return (result.Attributes as BlogPost) || null;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  async getAllPostsForSitemap(): Promise<{ slug: string; updated_at: string }[]> {
    console.log("Fetching all published posts for sitemap from table:", this.tableName);
    try {
      const params = {
        TableName: this.tableName,
        FilterExpression: 'published = :published',
        ExpressionAttributeValues: {
          ':published': true,
        },
        ProjectionExpression: 'slug, updated_at',
      };
      
      let allItems: { slug: string; updated_at: string }[] = [];
      let lastEvaluatedKey: Record<string, any> | undefined = undefined;

      do {
        const scanParams: any = { ...params, ExclusiveStartKey: lastEvaluatedKey };
        const result: any = await dynamodb.send(new ScanCommand(scanParams));
        if (result.Items) {
          allItems = allItems.concat(result.Items as { slug: string; updated_at: string }[]);
        }
        lastEvaluatedKey = result.LastEvaluatedKey;
      } while (lastEvaluatedKey);

      console.log(`Found ${allItems.length} posts for sitemap.`);
      return allItems;
    } catch (error: any) {
      console.error('Error fetching posts for sitemap:', error);
      throw error;
    }
  }

  async deletePost(id: string, created_at: string): Promise<boolean> {
    try {
      const params = {
        TableName: this.tableName,
        Key: { id, created_at },
      };

      await dynamodb.send(new DeleteCommand(params));
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  async incrementPostViews(id: string, created_at: string): Promise<void> {
    try {
      const params = {
        TableName: this.tableName,
        Key: { id, created_at },
        UpdateExpression: 'SET views = if_not_exists(views, :start) + :incr',
        ExpressionAttributeValues: {
          ':start': 0,
          ':incr': 1,
        },
      };
      await dynamodb.send(new UpdateCommand(params));
    } catch (error) {
      console.error('Error incrementing post views:', error);
      // 不拋出錯誤，因為這不是關鍵操作
    }
  }
}

export const dynamoDBService = new DynamoDBService();