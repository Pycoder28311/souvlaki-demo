export const Email = (
  name: string,
  intro: string = '',
  instructions: string = '',
  buttonColor: string = '#03A4FF',
  buttonText: string = '',
  outro: string = '',
  link: string = ''
) => {
  const styledEmail = {
    body: {
      name: name,
      intro: intro || 'Καλώς ήρθατε στην επιχείρησή μας!',
      action: {
        instructions: instructions || 'Κάντε κλικ σε αυτό το κουμπί για να επισκεφθείτε τον ιστότοπό μας.',
        button: {
          color: buttonColor || '#03A4FF',
          text: buttonText || 'Επιβεβαίωση λογαριασμού',
          link: link || 'https://www.sizodevelops.com/about'
        }
      },
      outro: outro || "Αυτό το μήνυμα είναι από το κανάλι YouTube της Sizo Develops",
    }
  };

  const plainText = `
  ${name} ${intro || 'Καλώς ήρθατε στην επιχείρησή μας!'}
  ${instructions || 'Κάντε κλικ σε αυτό το κουμπί για να επισκεφθείτε τον ιστότοπό μας.'}
  ${link || 'https://www.sizodevelops.com/about'}
  ${outro || "Αυτό το μήνυμα είναι από το κανάλι YouTube της Sizo Develops"}
  `;

  return { styledEmail, plainText };
};
