/**
 * Ảnh nền chờ dùng chung cho `next/image` (`placeholder="blur"`), giúp ảnh hiện
 * lên bằng một nhịp mờ dần thay vì bật ra đột ngột khi tải xong.
 *
 * Đây là một tấm PNG 8×6 pixel màu trung tính, KHÔNG phải bản thu nhỏ của từng
 * ảnh thật. Muốn mỗi ảnh có nền chờ đúng màu của chính nó thì phải tính bản thu
 * nhỏ lúc tải ảnh lên và lưu kèm — mà ảnh bìa bài viết hiện chỉ được lưu dưới
 * dạng một chuỗi URL, không có bảng nào để đính thêm dữ liệu. Một màu trung tính
 * đã đủ để bỏ nhịp "giật" khi ảnh xuất hiện.
 *
 * (Trước đây từng thử làm hiệu ứng này bằng CSS qua `img[data-loaded]` — không
 * chạy được: next/image đánh dấu ảnh đã tải bằng thuộc tính JavaScript
 * `data-loaded-src` trên phần tử chứ không phải attribute HTML, nên CSS không
 * chạm tới. `placeholder="blur"` là cách đúng.)
 */
export const BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAYAAAD+Bd/7AAAAZ0lEQVR4AVROyw6AIAyr/P9HGghKvKl4pbbjYFxY92hTlo720Nm2zr121nKx5ptlPZmVCYoxCPjRAAxVdaD2ySDNXGorDiEWqRHJECI1rhZQoPFz8GDb6TQgHhYDy98hRFziOyh82wsAAP//LjhQNgAAAAZJREFUAwAGTmqR8Re0hwAAAABJRU5ErkJggg=='
