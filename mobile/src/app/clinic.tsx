import { useState } from 'react';
import { addClinicVisit, lookupClinicStudent, type ClinicStudent } from '../api';
import { useAuth } from '../auth';
import Button, { TextButton } from '../Button';
import Field from '../Field';
import FormScreen, { FormError, StudentHeading, useSubmit } from '../FormScreen';
import { ScanStudent, type ScannedCard } from '../QrScanner';
import { colors } from '../theme';
import { VerdictScreen } from '../Verdict';

export default function ClinicScreen() {
  const { session } = useAuth();
  if (!session) return null;
  const { token } = session;
  return (
    <ScanStudent lookup={(qrToken) => lookupClinicStudent(token, qrToken)}>
      {(card, scanNext) => <VisitForm card={card} token={token} onDone={scanNext} />}
    </ScanStudent>
  );
}

function VisitForm({ card, token, onDone }: { card: ScannedCard<ClinicStudent>; token: string; onDone: () => void }) {
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [saved, setSaved] = useState(false);
  const { saving, error, submit } = useSubmit();
  const ready = diagnosis.trim() && prescription.trim();

  const save = () =>
    submit(async () => {
      await addClinicVisit(token, card.qrToken, { diagnosis: diagnosis.trim(), prescription: prescription.trim() });
      setSaved(true);
    });

  if (saved) {
    return (
      <VerdictScreen
        verdict={{ color: colors.serve, title: 'Visit saved', student: card.student, action: 'Scan next student' }}
        onDone={onDone}
      />
    );
  }

  return (
    <FormScreen>
      <StudentHeading student={card.student} />
      <Field label="Diagnosis" value={diagnosis} onChangeText={setDiagnosis} multiline maxLength={1000} editable={!saving} />
      <Field
        label="Prescription"
        value={prescription}
        onChangeText={setPrescription}
        multiline
        maxLength={1000}
        editable={!saving}
      />
      <FormError message={error} />
      <Button label={saving ? 'Saving…' : 'Save visit'} onPress={save} disabled={saving || !ready} />
      <TextButton label="Scan a different student" onPress={onDone} />
    </FormScreen>
  );
}
