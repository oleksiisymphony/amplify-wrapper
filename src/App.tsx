import React, { useState, useEffect } from 'react';
import { API, Storage } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';

const InnerApp = React.lazy(
  () => import('WebClientApp/App')
);

const initialFormState = { name: '', description: '' }

function App() {
  const [notes, setNotes] = useState([] as any);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function onChange(e: any) {
    if (!e.target.files[0]) return
    const file = e.target.files[0] as any;
    setFormData({ ...formData, image: file.name } as any);
    await Storage.put(file.name, file);
    fetchNotes();
  }

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes })as any;
    const notesFromAPI: any[] = apiData.data.listNotes.items;
    await Promise.all(notesFromAPI.map(async note => {
      if (note.image) {
        const image = await Storage.get(note.image);
        note.image = image;
      }
      return note;
    }))
    setNotes(apiData.data.listNotes.items);
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    if ((formData as any).image) {
      const image = await Storage.get((formData as any).image);
      (formData as any).image = image;
    }
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  }

  async function deleteNote({ id }: any) {
    const newNotesArray = notes.filter((note: any) => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }

  return (
    <div className="App">
      <h1>My Notes App</h1>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Note name"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Note description"
        value={formData.description}
      />
      <input
        type="file"
        onChange={onChange}
      />
      <button onClick={createNote}>Create Note</button>
      <div style={{marginBottom: 30}}>
        {
          (notes as any[]).map(note => (
            <div key={note.id || note.name}>
              <h2>{note.name}</h2>
              <p>{note.description}</p>
              <button onClick={() => deleteNote(note)}>Delete note</button>
              {
                note.image && <img src={note.image} style={{width: 400}} />
              }
            </div>
          ))
        }
      </div>
      <br/>
      <React.Suspense fallback='Loading Inner App'>
        <InnerApp />
      </React.Suspense>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);