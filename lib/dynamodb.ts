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
  author: string;
  created_at: string;
  updated_at: string;
  published: boolean;
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

  async getAllPosts(): Promise<BlogPost[]> {
    try {
      const params = {
        TableName: this.tableName,
      };

      const result = await dynamodb.send(new ScanCommand(params));
      return (result.Items as BlogPost[]) || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
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
    const status = 'published';
    console.log(`Searching for "${query}" with status=${status}`);
    
    try {
      const filterExpressions = ['(contains(title, :query) OR contains(content, :query))'];
      const expressionAttributeValues: { [key: string]: any } = {
        ':query': query,
      };

      if (status === 'published') {
        filterExpressions.push('published = :published');
        expressionAttributeValues[':published'] = true;
      } else if (status === 'draft') {
        filterExpressions.push('published = :published');
        expressionAttributeValues[':published'] = false;
      }
      // If status is 'all', we don't add any filter for the 'published' attribute.

      const params = {
        TableName: this.tableName,
        FilterExpression: filterExpressions.join(' AND '),
        ExpressionAttributeValues: expressionAttributeValues,
      };
      
      console.log("Search params:", JSON.stringify(params, null, 2));

      const result = await dynamodb.send(new ScanCommand(params));
      console.log(`Found ${result.Items?.length || 0} posts from search query.`);
      return (result.Items as BlogPost[]) || [];
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
}

export const dynamoDBService = new DynamoDBService();