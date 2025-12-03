/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import request from 'supertest';
import express from 'express';
import fetch from 'node-fetch';
import router from './a11yChat';

// Mock node-fetch
jest.mock('node-fetch');

// Properly type the mocked fetch
const mockedFetch = fetch as any;

describe('a11yChat Router', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use('/', router);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /a11y-chat', () => {
    it('should return health check status', async () => {
      const response = await request(app).get('/a11y-chat');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "ok",
        message: "a11y-chat endpoint is up"
      });
    });
  });

  describe('GET /a11y-chat/test-games', () => {
    it('should return game data when games are available', async () => {
      const mockGames = [
        {
          title: 'Test Game 1',
          developer: 'Test Dev',
          rating: 4.5,
          genre: 'Action',
          platform: 'PC',
          description: 'A test game description',
          accessibilityTags: [{ tag: 'Color Blind Friendly' }]
        },
        {
          title: 'Test Game 2',
          developer: 'Another Dev',
          rating: 3.8,
          genre: 'RPG',
          platform: 'Console',
          description: 'Another test game description',
          accessibilityTags: []
        }
      ];

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockGames)
      } as any);

      const response = await request(app).get('/a11y-chat/test-games');

      expect(response.status).toBe(200);
      expect(response.body?.success).toBe(true);
      expect(response.body?.totalGames).toBe(2);
      expect(response.body?.allGameTitles).toEqual(['Test Game 1', 'Test Game 2']);
    });

    it('should handle empty game data', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue([])
      } as any);

      const response = await request(app).get('/a11y-chat/test-games');

      expect(response.status).toBe(200);
      expect(response.body?.success).toBe(true);
      expect(response.body?.totalGames).toBe(0);
      expect(response.body?.gameInfo).toBe('No games currently available in database.');
    });

    it('should handle paginated response format', async () => {
      const mockPaginatedResponse = {
        data: [
          {
            title: 'Paginated Game',
            developer: 'Test Dev',
            rating: 4.0,
            genre: 'Adventure',
            platform: 'PC',
            description: 'A paginated game',
            accessibilityTags: []
          }
        ],
        total: 1
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockPaginatedResponse)
      } as any);

      const response = await request(app).get('/a11y-chat/test-games');

      expect(response.status).toBe(200);
      expect(response.body?.totalGames).toBe(1);
    });
  });

  describe('GET /a11y-chat/test-settings/:userId', () => {
    it('should return user settings when available', async () => {
      const mockSettings = {
        theme: 'dark-mode',
        textSize: 18,
        highContrast: true,
        colorblindFilter: 'protanopia',
        visual: true,
        hearing: false,
        dexterity: true,
        cognitive: false,
        screenMagnifier: true
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockSettings)
      } as any);

      const response = await request(app).get('/a11y-chat/test-settings/123');

      expect(response.status).toBe(200);
      expect(response.body?.success).toBe(true);
      expect(response.body?.userId).toBe(123);
      expect(response.body?.settings).toEqual(mockSettings);
      expect(response.body?.formattedSettings).toContain('dark-mode');
      expect(response.body?.formattedSettings).toContain('18px');
    });    it('should handle settings not found', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('User not found')
      } as any);

      const response = await request(app).get('/a11y-chat/test-settings/999');

      expect(response.status).toBe(200);
      expect(response.body?.success).toBe(true);
      expect(response.body?.settings).toBe(null);
      expect(response.body?.formattedSettings).toBe('Could not retrieve user accessibility settings.');
    });
  });

  describe('POST /a11y-chat/test-update/:userId', () => {
    it('should successfully update user setting', async () => {
      // Mock fetch for getting current settings
      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue({ theme: 'light-mode', textSize: 16 })
        } as any)
        // Mock fetch for updating settings
        .mockResolvedValueOnce({
          ok: true,
          status: 200
        } as any);

      const response = await request(app)
        .post('/a11y-chat/test-update/123')
        .send({ setting: 'theme', value: 'dark-mode' });

      expect(response.status).toBe(200);
      expect(response.body?.success).toBe(true);
      expect(response.body?.setting).toBe('theme');
      expect(response.body?.value).toBe('dark-mode');
    });

    it('should handle update failure', async () => {
      // Mock fetch to fail on getting current settings
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('User not found')
      } as any);

      const response = await request(app)
        .post('/a11y-chat/test-update/123')
        .send({ setting: 'theme', value: 'dark-mode' });

      expect(response.status).toBe(200);
      expect(response.body?.success).toBe(false);
      expect(response.body?.message).toBe('Failed to update setting');
    });
  });

  describe('POST /a11y-chat', () => {
    beforeEach(() => {
      // Mock successful responses by default
      mockedFetch.mockImplementation((url: any) => {
        const urlStr = typeof url === 'string' ? url : url?.toString();
        
        if (urlStr?.includes('ollama')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({
              message: { content: 'Hello! How can I help you with accessibility today?' }
            })
          } as any);
        }
        
        return Promise.resolve({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue([])
        } as any);
      });
    });

    it('should process valid chat messages', async () => {
      const chatRequest = {
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        context: { userId: 123 }
      };

      const response = await request(app)
        .post('/a11y-chat')
        .send(chatRequest);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reply');
      expect(typeof response.body.reply).toBe('string');
    });

    it('should handle navigation commands from AI response', async () => {
      mockedFetch.mockImplementation((url: any) => {
        const urlStr = typeof url === 'string' ? url : url?.toString();
        
        if (urlStr?.includes('ollama')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({
              message: { 
                content: '{"reply": "Taking you to the home page!", "command": {"type": "navigate", "target": "home"}}' 
              }
            })
          } as any);
        }
        
        return Promise.resolve({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue([])
        } as any);
      });

      const chatRequest = {
        messages: [
          { role: 'user', content: 'take me home' }
        ]
      };

      const response = await request(app)
        .post('/a11y-chat')
        .send(chatRequest);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('command');
      expect(response.body.command?.type).toBe('navigate');
      expect(response.body.command?.target).toBe('home');
    });    it('should handle setting update commands', async () => {
      mockedFetch.mockImplementation((url: any, options: any = {}) => {
        const urlStr = typeof url === 'string' ? url : url?.toString();
        
        if (urlStr?.includes('ollama')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({
              message: { 
                content: '{"reply": "Setting your theme to dark mode!", "command": {"type": "update_setting", "setting": "theme", "value": "dark-mode"}}' 
              }
            })
          } as any);
        }
        
        if (urlStr?.includes('accessibility-settings')) {
          // Mock GET request for current settings
          if (!options.method || options.method === 'GET') {
            return Promise.resolve({
              ok: true,
              status: 200,
              json: jest.fn().mockResolvedValue({ theme: 'light-mode', textSize: 16 })
            } as any);
          }
          // Mock PUT request for update
          if (options.method === 'PUT') {
            return Promise.resolve({
              ok: true,
              status: 200
            } as any);
          }
        }
        
        return Promise.resolve({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue([])
        } as any);
      });

      const chatRequest = {
        messages: [
          { role: 'user', content: 'change theme to dark' }
        ],
        context: { userId: 123 }
      };

      const response = await request(app)
        .post('/a11y-chat')
        .send(chatRequest);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('command');
      expect(response.body.command?.type).toBe('update_setting');
      expect(response.body.command?.setting).toBe('theme');
      expect(response.body.command?.value).toBe('dark-mode');
    });

    it('should return 400 for invalid messages format', async () => {
      const response = await request(app)
        .post('/a11y-chat')
        .send({ messages: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body?.error).toBe('messages must be a non-empty array');
    });

    it('should return 400 for empty messages array', async () => {
      const response = await request(app)
        .post('/a11y-chat')
        .send({ messages: [] });

      expect(response.status).toBe(400);
      expect(response.body?.error).toBe('messages must be a non-empty array');
    });    it('should force navigation command for navigation keywords', async () => {
      mockedFetch.mockImplementation((url: any) => {
        const urlStr = typeof url === 'string' ? url : url?.toString();
        
        if (urlStr?.includes('ollama')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({
              message: { content: 'I can help you navigate to the browser page.' }
            })
          } as any);
        }
        
        return Promise.resolve({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue([])
        } as any);
      });

      const chatRequest = {
        messages: [
          { role: 'user', content: 'go to browse games' }
        ]
      };

      const response = await request(app)
        .post('/a11y-chat')
        .send(chatRequest);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('command');
      expect(response.body.command?.type).toBe('navigate');
      expect(response.body.command?.target).toBe('browserpage');
    });

    it('should force setting update for setting keywords with user context', async () => {
      // Mock settings fetch and update
      mockedFetch.mockImplementation((url: any) => {
        const urlStr = typeof url === 'string' ? url : url?.toString();
        
        if (urlStr?.includes('ollama')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({
              message: { content: 'I can help you increase text size.' }
            })
          } as any);
        }
        
        if (urlStr?.includes('accessibility-settings')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({ textSize: 16 })
          } as any);
        }
        
        return Promise.resolve({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue([])
        } as any);
      });

      const chatRequest = {
        messages: [
          { role: 'user', content: 'increase text size' }
        ],
        context: { userId: 123 }
      };

      const response = await request(app)
        .post('/a11y-chat')
        .send(chatRequest);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('command');
      expect(response.body.command?.type).toBe('update_setting');
      expect(response.body.command?.setting).toBe('textSize');
      expect(response.body.command?.value).toBe(18);
    });    it('should handle server errors gracefully', async () => {
      mockedFetch.mockRejectedValue(new Error('Network failure'));

      const chatRequest = {
        messages: [
          { role: 'user', content: 'Hello' }
        ]
      };

      const response = await request(app)
        .post('/a11y-chat')
        .send(chatRequest);

      expect(response.status).toBe(500);
      expect(response.body?.error).toBe('server_error');
    });

    it('should handle message truncation for long conversations', async () => {
      const manyMessages = Array.from({ length: 15 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i + 1} - ${'.'.repeat(100)}` // Long content
      }));

      const chatRequest = {
        messages: manyMessages
      };

      const response = await request(app)
        .post('/a11y-chat')
        .send(chatRequest);

      expect(response.status).toBe(200);
    });

    it('should handle user without login context', async () => {
      const chatRequest = {
        messages: [
          { role: 'user', content: 'Hello' }
        ]
        // No context provided
      };

      const response = await request(app)
        .post('/a11y-chat')
        .send(chatRequest);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reply');
    });

    it('should handle theme setting updates', async () => {
      mockedFetch.mockImplementation((url: any) => {
        const urlStr = typeof url === 'string' ? url : url?.toString();
        
        if (urlStr?.includes('accessibility-settings')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({ theme: 'light-mode' })
          } as any);
        }
        
        return Promise.resolve({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue({
            message: { content: 'Changed theme successfully.' }
          })
        } as any);
      });

      const chatRequest = {
        messages: [
          { role: 'user', content: 'change theme to dark' }
        ],
        context: { userId: 123 }
      };

      const response = await request(app)
        .post('/a11y-chat')
        .send(chatRequest);

      expect(response.status).toBe(200);
    });
  });
});