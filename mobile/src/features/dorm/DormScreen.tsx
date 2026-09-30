import { useState } from 'react';
import { useAuth } from '../../core/auth';
import Button, { TextButton } from '../../core/Button';
import Field from '../../core/Field';
import FormScreen, { FormError, StudentHeading, useSubmit } from '../../core/FormScreen';
import { ScanStudent, type ScannedCard } from '../../core/QrScanner';
import { colors } from '../../core/theme';
import { VerdictScreen } from '../../core/Verdict';
import { lookupDorm, saveDorm, type DormAssignment, type DormStudent } from './api';

export default function DormScreen() {
  const { session } = useAuth();
  if (!session) return null;
  const { token } = session;
  return (
    <ScanStudent lookup={(qrToken) => lookupDorm(token, qrToken)}>
      {(card, scanNext) => <DormForm card={card} token={token} onDone={scanNext} />}
    </ScanStudent>
  );
}

function DormForm({ card, token, onDone }: { card: ScannedCard<DormStudent>; token: string; onDone: () => void }) {
  const { student, assignment } = card;
  const [room, setRoom] = useState(assignment?.room ?? '');
  const [bed, setBed] = useState(assignment?.bed ?? '');
  const [items, setItems] = useState(assignment ? String(assignment.itemCount) : '');
  const [saved, setSaved] = useState<DormAssignment | null>(null);
  const { saving, error, setError, submit } = useSubmit();

  const itemCount = Number(items.trim());
  const ready = room.trim() && bed.trim() && /^\d{1,3}$/.test(items.trim());

  const save = () =>
    submit(async () => {
      const response = await saveDorm(token, card.qrToken, { room: room.trim(), bed: bed.trim(), itemCount });
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
