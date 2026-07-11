import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { sanphamAPI, danhmucAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const activeCategory = searchParams.get('id_dm') ? Number(searchParams.get('id_dm')) : null;

  useEffect(() => {
    danhmucAPI.getAll().then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory) params.id_dm = activeCategory;
    if (search) params.search = search;
    sanphamAPI.getAll(params)
      .then(r => setProducts(r.data))
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

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

        {/* Results */}
        {loading ? (
          <div className="spinner" />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 64 }}>🔍</div>
            <h3>Không tìm thấy sản phẩm</h3>
            <p style={{ color: 'var(--text-muted)' }}>Thử tìm kiếm với từ khóa khác</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>
              Hiển thị {products.length} sản phẩm
            </p>
            <div className="product-grid">
              {products.map(p => <ProductCard key={p.id_sp} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
