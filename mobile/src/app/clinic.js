import { useState } from 'react';
import { addClinicVisit, lookupClinicStudent } from '../api';
import Button, { TextButton } from '../Button';
import Field from '../Field';
import FormScreen, { FormError, StudentHeading, useSubmit } from '../FormScreen';
import { ScanStudent } from '../QrScanner';
import StaffGate from '../StaffGate';
import { colors } from '../theme';
import { VerdictScreen } from '../Verdict';

export default function ClinicScreen() {
  return (
    <StaffGate service="clinic" label="clinic">
      {({ staffKey, signOut }) => (
        <ScanStudent staffKey={staffKey} lookup={lookupClinicStudent} onSignOut={signOut}>
          {(card, scanNext) => <VisitForm card={card} staffKey={staffKey} onDone={scanNext} onSignOut={signOut} />}
        </ScanStudent>
      )}
    </StaffGate>
  );
}

function VisitForm({ card, staffKey, onDone, onSignOut }) {
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [saved, setSaved] = useState(false);
  const { saving, error, submit } = useSubmit(onSignOut);
  const ready = diagnosis.trim() && prescription.trim();

  const save = () =>
    submit(async () => {
      await addClinicVisit(staffKey, card.qrToken, { diagnosis: diagnosis.trim(), prescription: prescription.trim() });
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
