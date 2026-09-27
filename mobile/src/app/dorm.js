import { useState } from 'react';
import { lookupDorm, saveDorm } from '../api';
import Button, { TextButton } from '../Button';
import Field from '../Field';
import FormScreen, { FormError, StudentHeading, useSubmit } from '../FormScreen';
import { ScanStudent } from '../QrScanner';
import StaffGate from '../StaffGate';
import { colors } from '../theme';
import { VerdictScreen } from '../Verdict';

export default function DormScreen() {
  return (
    <StaffGate service="dorm" label="dormitory">
      {({ staffKey, signOut }) => (
        <ScanStudent staffKey={staffKey} lookup={lookupDorm} onSignOut={signOut}>
          {(card, scanNext) => <DormForm card={card} staffKey={staffKey} onDone={scanNext} onSignOut={signOut} />}
        </ScanStudent>
      )}
    </StaffGate>
  );
}

function DormForm({ card, staffKey, onDone, onSignOut }) {
  const { student, assignment } = card;
  const [room, setRoom] = useState(assignment?.room ?? '');
  const [bed, setBed] = useState(assignment?.bed ?? '');
  const [items, setItems] = useState(assignment ? String(assignment.itemCount) : '');
  const [saved, setSaved] = useState(null);
  const { saving, error, setError, submit } = useSubmit(onSignOut);

  const itemCount = /^\d{1,3}$/.test(items.trim()) ? Number(items.trim()) : null;
  const ready = room.trim() && bed.trim() && itemCount !== null;

  const save = () =>
    submit(async () => {
      const response = await saveDorm(staffKey, card.qrToken, { room: room.trim(), bed: bed.trim(), itemCount });
      if (response.result === 'bed_taken') {
        setError(`Room ${room.trim()}, bed ${bed.trim()} already belongs to ${response.holder.name} (${response.holder.id}).`);
        return;
      }
      setSaved(response.assignment);
    });

  if (saved) {
    return (
      <VerdictScreen
        verdict={{
          color: colors.serve,
          title: 'Dorm details saved',
          student,
          note: `Room ${saved.room}, bed ${saved.bed}, ${saved.itemCount} ${saved.itemCount === 1 ? 'item' : 'items'}`,
          action: 'Scan next student',
        }}
        onDone={onDone}
      />
    );
  }

  return (
    <FormScreen>
      <StudentHeading student={student} />
      <Field label="Room" value={room} onChangeText={setRoom} autoCapitalize="characters" maxLength={30} editable={!saving} />
      <Field label="Bed" value={bed} onChangeText={setBed} autoCapitalize="characters" maxLength={10} editable={!saving} />
      <Field
        label="Number of items"
        value={items}
        onChangeText={setItems}
        keyboardType="number-pad"
        maxLength={3}
        editable={!saving}
      />
      <FormError message={error} />
      <Button label={saving ? 'Saving…' : 'Save'} onPress={save} disabled={saving || !ready} />
      <TextButton label="Scan a different student" onPress={onDone} />
    </FormScreen>
  );
}
