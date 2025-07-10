import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.NETLIFY_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NETLIFY_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || "",
  },
});

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
    this.tableName = process.env.DYNAMODB_TABLE_NAME || 'posts';
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
    try {
      const params = {
        TableName: this.tableName,
        FilterExpression: 'published = :published',
        ExpressionAttributeValues: {
          ':published': true,
        },
      };

      const result = await dynamodb.send(new ScanCommand(params));
      return (result.Items as BlogPost[]) || [];
    } catch (error) {
      console.error('Error fetching published posts:', error);
      throw error;
    }
  }

  async getPostById(id: string): Promise<BlogPost | null> {
    try {
      const params = {
        TableName: this.tableName,
        FilterExpression: 'id = :id',
        ExpressionAttributeValues: {
          ':id': id,
        },
      };

      const result = await dynamodb.send(new ScanCommand(params));
      const items = result.Items as BlogPost[];
      return items && items.length > 0 ? items[0] : null;
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
      return items && items.length > 0 ? items[0] : null;
    } catch (error) {
      console.error('Error fetching post by slug:', error);
      throw error;
    }
  }

  async searchPosts(query: string, publishedOnly: boolean = true): Promise<BlogPost[]> {
    try {
      let filterExpression = '';
      let expressionAttributeValues: { [key: string]: any } = {};

      if (publishedOnly) {
        filterExpression = 'published = :published AND (contains(title, :query) OR contains(content, :query))';
        expressionAttributeValues = {
          ':published': true,
          ':query': query,
        };
      } else {
        filterExpression = 'contains(title, :query) OR contains(content, :query)';
        expressionAttributeValues = {
          ':query': query,
        };
      }

      const params = {
        TableName: this.tableName,
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues,
      };

      const result = await dynamodb.send(new ScanCommand(params));
      return (result.Items as BlogPost[]) || [];
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  }

  async createPost(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost> {
    try {
      const { v4: uuidv4 } = require('uuid');
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