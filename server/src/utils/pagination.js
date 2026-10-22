function parsePagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;
  const sortBy = String(query.sortBy || 'createdAt');
  const sortDir = String(query.sortDir || 'desc').toLowerCase() === 'asc' ? 1 : -1;
  return { page, limit, skip, sort: { [sortBy]: sortDir } };
}

function paginated(items, total, page, limit) {
  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

module.exports = { parsePagination, paginated };
