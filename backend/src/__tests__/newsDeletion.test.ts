import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { deleteNews } from '../controllers/newsController';
import News from '../models/News';

jest.mock('../models/News');

describe('News Controller - deleteNews', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    mockRes = {
      status: statusMock as any,
      json: jsonMock as any,
    };
    
    jest.clearAllMocks();
  });

  it('should return 400 if the provided ID is not a valid ObjectId', async () => {
    mockReq = {
      params: { id: 'invalid-id' }
    };

    await deleteNews(mockReq as Request, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Invalid News ID format. Cannot proceed with deletion.'
    });
  });

  it('should return 404 if the news article does not exist', async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    mockReq = { params: { id: validId } };

    (News.findById as jest.Mock).mockResolvedValue(null as any);

    await deleteNews(mockReq as Request, mockRes as Response);

    expect(News.findById).toHaveBeenCalledWith(validId);
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'News article not found. It may have already been deleted.'
    });
  });

  it('should return 500 if a database error occurs during find', async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    mockReq = { params: { id: validId } };

    const errorMessage = 'Database connection failed';
    (News.findById as jest.Mock).mockRejectedValue(new Error(errorMessage) as never);

    await deleteNews(mockReq as Request, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      message: 'An internal server error occurred while deleting the news article.'
    }));
  });

  it('should delete the news and return 200 on successful deletion', async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    mockReq = { params: { id: validId } };

    const mockNewsItem = {
      _id: validId,
      deleteOne: jest.fn().mockResolvedValue(true as never)
    };

    (News.findById as jest.Mock).mockResolvedValue(mockNewsItem as any);

    await deleteNews(mockReq as Request, mockRes as Response);

    expect(News.findById).toHaveBeenCalledWith(validId);
    expect(mockNewsItem.deleteOne).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'News article successfully deleted.'
    });
  });
});