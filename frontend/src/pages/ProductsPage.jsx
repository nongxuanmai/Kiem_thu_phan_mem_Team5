import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { sanphamAPI, danhmucAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

const SORT_OPTIONS = [
  { value: 'az',         label: 'Theo ký tự (A - Z)' },
  { value: 'price_asc',  label: 'Giá: Thấp đến Cao' },
  { value: 'price_desc', label: 'Giá: Cao đến Thấp' },
  { value: 'popular',    label: 'Bán Chạy' },
  { value: 'newest',     label: 'Mới Nhất' },
];

function sortProducts(list, sortBy) {
  const arr = [...list];
  switch (sortBy) {
    case 'az':         return arr.sort((a, b) => (a.ten_sp || '').localeCompare(b.ten_sp || '', 'vi'));
    case 'price_asc':  return arr.sort((a, b) => (a.gia_sp || 0) - (b.gia_sp || 0));
    case 'price_desc': return arr.sort((a, b) => (b.gia_sp || 0) - (a.gia_sp || 0));
    case 'popular':    return arr.sort((a, b) => (b.soluong_sp || 0) - (a.soluong_sp || 0));
    case 'newest':     return arr.sort((a, b) => b.id_sp - a.id_sp);
    default:           return arr;
  }
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('az');
  const activeCategory = searchParams.get('id_dm') ? Number(searchParams.get('id_dm')) : null;

  useEffect(() => {
    danhmucAPI.getAll()
      .then(r => setCategories(r.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory) params.id_dm = activeCategory;
    if (search) params.search = search;
    sanphamAPI.getAll(params)
      .then(r => setProducts(r.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);

  const handleSearch = e => {
    e.preventDefault();
    const val = e.target.search.value;
    setSearch(val);
  };

  return (
    <div className="page-wrapper">
      <div className="container section">
        <div className="section-header" style={{ textAlign: 'left' }}>
          <div className="section-label">Bộ Sưu Tập</div>
          <h1 className="section-title">Tất Cả Sản Phẩm</h1>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch}>
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              name="search"
              className="form-control"
              placeholder="Tìm kiếm túi xách..."
              style={{ paddingLeft: 48, borderRadius: 50 }}
            />
          </div>
        </form>

        {/* Category Filter */}
        <div className="filter-bar">
          <button
            className={`filter-chip ${!activeCategory ? 'active' : ''}`}
            onClick={() => setSearchParams({})}
          >
            Tất Cả
          </button>
          {categories.map(cat => (
            <button
              key={cat.id_dm}
              className={`filter-chip ${activeCategory === cat.id_dm ? 'active' : ''}`}
              onClick={() => setSearchParams({ id_dm: cat.id_dm })}
            >
              {cat.tendanhmuc}
            </button>
          ))}
        </div>

        {/* Sort Bar */}
        <div className="sort-bar">
          <span className="sort-label">Sắp xếp theo:</span>
          <div className="sort-chips">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`sort-chip ${sortBy === opt.value ? 'active' : ''}`}
                onClick={() => setSortBy(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="spinner" />
        ) : sortedProducts.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 64 }}>🔍</div>
            <h3>Không tìm thấy sản phẩm</h3>
            <p style={{ color: 'var(--text-muted)' }}>Thử tìm kiếm với từ khóa khác</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>
              Hiển thị {sortedProducts.length} sản phẩm
            </p>
            <div className="product-grid">
              {sortedProducts.map(p => <ProductCard key={p.id_sp} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
