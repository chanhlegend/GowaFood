// src/components/reviews/Reviews.jsx
import { useEffect, useMemo, useState } from "react";
import { Star, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewService } from "@/services/ReviewService";
import { toast } from "sonner";
const SORTS = [
  { key: "newest", label: "Mới nhất" },
  { key: "oldest", label: "Cũ nhất" },
  { key: "highest", label: "Cao nhất" },
  { key: "lowest", label: "Thấp nhất" },
];

export default function Reviews({ productId }) {
  const [stats, setStats] = useState({ average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(4);
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);

  // form viết đánh giá
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [myReview, setMyReview] = useState(null); // nếu user đã từng đánh giá

  // load stats + list
  useEffect(() => {
    if (!productId) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [s, l] = await Promise.all([
          ReviewService.stats(productId),
          ReviewService.list(productId, { page, limit, sort }),
        ]);
        if (!mounted) return;
        setStats({
          average: s?.average || 0,
          total: s?.total || 0,
          distribution: s?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        });
        setItems(l?.items || []);
        setPages(l?.pagination?.pages || 1);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [productId, page, limit, sort]);

  // load review của chính mình (để nhắc user đã đánh giá)
  useEffect(() => {
    if (!productId) return;
    let mounted = true;
    (async () => {
      try {
        const mine = await ReviewService.getMine(productId);
        if (!mounted) return;
        setMyReview(mine?.item || null);
        if (mine?.item) {
          setNewRating(mine.item.rating);
          setNewComment(mine.item.comment || "");
        }
      } catch (e) {
        // thường lỗi do chưa đăng nhập -> bỏ qua
      }
    })();
    return () => (mounted = false);
  }, [productId]);

  const rows = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: stats.distribution?.[star] || 0,
        pct: stats.total ? Math.round(((stats.distribution?.[star] || 0) / stats.total) * 100) : 0,
      })),
    [stats]
  );

  async function handleVote(id, value) {
    try {
      await ReviewService.vote(id, value);
      toast.success("Cảm ơn phản hồi của bạn!");
      const updated = await ReviewService.list(productId, { page, limit, sort });
      setItems(updated.items);
    } catch (e) {
      toast.error(e?.message || "Bình chọn thất bại");
    }
  }

  async function submitReview() {
    if (!productId) return;
    if (!newComment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }
    try {
      setSubmitting(true);
      const res = await ReviewService.create({
        productId,
        rating: newRating,
        comment: newComment.trim(),
      });
      setMyReview(res?.item || null);

      const [s, l] = await Promise.all([
        ReviewService.stats(productId),
        ReviewService.list(productId, { page: 1, limit, sort: "newest" }),
      ]);
      setStats({
        average: s?.average || 0,
        total: s?.total || 0,
        distribution: s?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
      setItems(l?.items || []);
      setPages(l?.pagination?.pages || 1);
      setPage(1);

      toast.success(myReview ? "Đã cập nhật đánh giá của bạn" : "Gửi đánh giá thành công");
    } catch (e) {
      toast.error(e?.message || "Gửi đánh giá thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="reviews" className="max-w-4xl mx-auto">
      <div className="rounded-xl border bg-white p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-4">Đánh giá sản phẩm</h2>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="text-center">
            <div className="text-4xl font-extrabold text-emerald-700">
              {Number(stats.average || 0).toFixed(1)}
            </div>
            <div className="mt-1 flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < Math.round(stats.average) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Dựa trên {stats.total} đánh giá</p>
          </div>

          <div className="md:col-span-2 space-y-2">
            {rows.map((r) => (
              <div key={r.star} className="flex items-center gap-3">
                <span className="w-8 text-sm text-gray-600">{r.star}★</span>
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-2 bg-emerald-600 rounded-full" style={{ width: `${r.pct}%` }} />
                </div>
                <span className="w-10 text-right text-sm text-gray-600">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Write review */}
        <div className="mt-6 rounded-xl border bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">{myReview ? "Cập nhật đánh giá của bạn:" : "Viết đánh giá của bạn:"}</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewRating(s)}
                      className={`text-xl leading-none ${s <= newRating ? "text-yellow-400" : "text-gray-300"}`}
                      aria-label={`Chọn ${s} sao`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="text-xs text-gray-500">({newRating}/5)</span>
              </div>

              <textarea
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
                rows={4}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />

              <div className="mt-3">
                <Button
                  onClick={submitReview}
                  disabled={submitting}
                  className="h-10 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {submitting ? "Đang gửi..." : myReview ? "Cập nhật đánh giá" : "Gửi đánh giá"}
                </Button>
                {myReview && (
                  <span className="ml-3 text-xs text-gray-500">
                    Bạn đã đánh giá {myReview.rating}/5 vào {new Date(myReview.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">Tất cả đánh giá ({stats.total})</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Sắp xếp theo:</span>
            <div className="flex gap-1">
              {SORTS.map((s) => (
                <Button
                  key={s.key}
                  size="sm"
                  variant={sort === s.key ? "default" : "outline"}
                  className={`h-8 ${sort === s.key ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                  onClick={() => {
                    setPage(1);
                    setSort(s.key);
                  }}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="mt-4 divide-y rounded-xl border bg-white">
          {loading && <div className="p-6 text-sm text-gray-500">Đang tải đánh giá…</div>}
          {!loading && items.length === 0 && (
            <div className="p-6 text-sm text-gray-500">Chưa có đánh giá nào.</div>
          )}

          {items.map((rv) => (
            <div key={rv._id} className="p-4 md:p-5">
              <div className="flex items-start gap-3">
                <img
                  src={rv.user?.avatar || "/avatar-placeholder.png"}
                  alt={rv.user?.name || "User"}
                  className="w-10 h-10 rounded-full border object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{rv.user?.name || "Khách hàng"}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{rv.rating}/5 sao</span>
                        <span>•</span>
                        <time>{new Date(rv.createdAt).toLocaleDateString("vi-VN")}</time>
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{rv.comment}</p>

                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <button
                      onClick={() => handleVote(rv._id, "up")}
                      className="inline-flex items-center gap-1 hover:text-emerald-700"
                    >
                      <ThumbsUp className="h-4 w-4" /> Hữu ích ({rv.upVotes || 0})
                    </button>
                    <button
                      onClick={() => handleVote(rv._id, "down")}
                      className="inline-flex items-center gap-1 hover:text-emerald-700"
                    >
                      <ThumbsDown className="h-4 w-4" /> Không hữu ích ({rv.downVotes || 0})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-9"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Trang trước
            </Button>

            {Array.from({ length: pages }).map((_, i) => {
              const n = i + 1;
              const active = n === page;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-9 w-9 rounded-md border text-sm font-medium ${active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white hover:bg-gray-50"
                    }`}
                >
                  {n}
                </button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="h-9"
            >
              Trang sau <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
