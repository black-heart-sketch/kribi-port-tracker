import { Types } from 'mongoose';
import ErrorResponse from '../utils/errorResponse.js';

const advancedResults = (model, populate, filter = {}) => {
  return async (req, res, next) => {
    try {
      // 1) Create query object with default filter
      let query = { ...filter };
      
      // 2) Copy req.query
      const reqQuery = { ...req.query };
      
      // 3) Fields to exclude from filtering
      const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
      removeFields.forEach(param => delete reqQuery[param]);
      
      // 4) Create query string for filtering
      let queryStr = JSON.stringify(reqQuery);
      
      // 5) Create operators ($gt, $gte, $lt, $lte, $in)
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
      
      // 6) Parse the query string and merge with default filter
      const parsedQuery = JSON.parse(queryStr);
      query = { ...query, ...parsedQuery };
      
      // 7) Handle search parameter if provided
      if (req.query.search) {
        const searchFields = ['name', 'description', 'title', 'imoNumber'];
        const searchQuery = searchFields
          .map(field => ({
            [field]: { $regex: req.query.search, $options: 'i' }
          }));
        
        query = {
          ...query,
          $or: searchQuery
        };
      }
      
      // 8) Build the query
      let dbQuery = model.find(query);
      
      // 9) Select fields
      if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        dbQuery = dbQuery.select(fields);
      }
      
      // 10) Sort
      if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        dbQuery = dbQuery.sort(sortBy);
      } else {
        dbQuery = dbQuery.sort('-createdAt');
      }
      
      // 11) Pagination
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 25;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const total = await model.countDocuments(query);
      
      dbQuery = dbQuery.skip(startIndex).limit(limit);
      
      // 12) Populate if specified
      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(item => {
            dbQuery = dbQuery.populate(item);
          });
        } else {
          dbQuery = dbQuery.populate(populate);
        }
      }
      
      // 13) Execute query
      const results = await dbQuery;
      
      // 14) Pagination result
      const pagination = {};
      
      if (endIndex < total) {
        pagination.next = {
          page: page + 1,
          limit
        };
      }
      
      if (startIndex > 0) {
        pagination.prev = {
          page: page - 1,
          limit
        };
      }
      
      // 15) Add results to response object
      res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
      };
      
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default advancedResults;
