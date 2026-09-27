import { scanMealCard } from '../api';
import QrScanner from '../QrScanner';
import StaffGate from '../StaffGate';
import { colors } from '../theme';
import { unknownCard } from '../Verdict';

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

function toVerdict({ result, student, tickedAt }) {
  if (result === 'ticked') {
    return { color: colors.serve, title: 'Meal ticked', student, action: 'Scan next card' };
  }
  if (result === 'already_ticked') {
    return {
      color: colors.refuse,
      title: 'Already ate today',
      student,
      note: `Ticked at ${timeFormat.format(new Date(tickedAt))}`,
      action: 'Scan next card',
    };
  }
  return unknownCard;
}

export default function MealsScreen() {
  return (
    <StaffGate service="meals" label="meal card">
      {({ staffKey, signOut }) => (
        <QrScanner
          prompt="Point the camera at a student’s meal card."
          onScan={async (qrToken) => toVerdict(await scanMealCard(staffKey, qrToken))}
          onSignOut={signOut}
        />
      )}
    </StaffGate>
  );
}
