import { useLocalSearchParams } from "expo-router";
import ReservationDetailScreen from "@/components/ReservationDetailScreen";

export default function ReservationDetailPro() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return null;
  return <ReservationDetailScreen id={id} />;
}
