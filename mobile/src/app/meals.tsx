import { scanMealCard, type MealScan } from '../api';
import { useAuth } from '../auth';
import QrScanner from '../QrScanner';
import { colors } from '../theme';
import { unknownCard, type VerdictInfo } from '../Verdict';

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

function toVerdict(scan: MealScan): VerdictInfo {
  if (scan.result === 'ticked') {
    return { color: colors.serve, title: 'Meal ticked', student: scan.student, action: 'Scan next card' };
  }
  if (scan.result === 'already_ticked') {
    return {
      color: colors.refuse,
      title: 'Already ate today',
      student: scan.student,
      note: `Ticked at ${timeFormat.format(new Date(scan.tickedAt))}`,
      action: 'Scan next card',
    };
  }
  return unknownCard;
}

export default function MealsScreen() {
  const { session } = useAuth();
  if (!session) return null;
  return (
    <QrScanner
      prompt="Point the camera at a student’s meal card."
      onScan={async (qrToken) => toVerdict(await scanMealCard(session.token, qrToken))}
    />
  );
}
