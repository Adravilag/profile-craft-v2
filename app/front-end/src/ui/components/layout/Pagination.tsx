import React from 'react';

export default function Pagination({ page = 1, total = 1, onPage = () => {} }: any) {
  return (
    <nav aria-label="pagination">
      <button onClick={() => onPage(Math.max(1, page - 1))}>Prev</button>
      <span>
        {page} / {total}
      </span>
      <button onClick={() => onPage(Math.min(total, page + 1))}>Next</button>
    </nav>
  );
}
