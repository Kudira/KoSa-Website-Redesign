import { BrandLoader } from '@/components/shared/BrandLoader';

export default function Loading() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <BrandLoader size={72} />
    </div>
  );
}
