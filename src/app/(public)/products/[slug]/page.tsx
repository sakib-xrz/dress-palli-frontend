export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  return (
    <div>
      <h1>Product Detail {slug}</h1>
    </div>
  );
}
