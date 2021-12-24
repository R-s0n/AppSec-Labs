const get_submissions = () => {
    document.getElementsByTagName('tbody')[0].innerHTML = '';
    fetch('/api/list')
    .then(resp => resp.json())
    .then(resp => {
        for(let submission of resp.submissions) {
            let template = `
                <tr>
                    <th scope="row">${submission.id}</th>
                    <td>${submission.user}</td>
                    <td>${submission.idea}</td>
                    <td>${submission.created_at}</td>
                </tr>
            `;
            document.getElementsByTagName('tbody')[0].innerHTML += template;
        }
    });

};

get_submissions();

setInterval(get_submissions, 4000);