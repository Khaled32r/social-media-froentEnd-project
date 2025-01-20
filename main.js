
const api='https://tarmeezacademy.com/api/v1';

function getAllPosts(page=1){

    fetch(api+`/posts?page=${page}`)
    .then((respons)=>respons.json())
    .then((a)=>{
        let posts =a.data
        lastBage=a.meta.lastPage
        for(let post of posts){
            // let tags=post.tags
            // for(let tag of tags){
                let cardPost=`
                <div class="card my-2" onclick="postClick(${post.id})" style="background-color: rgba(79, 100, 235, 0.349);cursor: pointer;">
                    <div class="card-header">
                        <img src="${post.author.profile_image}" style="width: 30px;height: 30px;border: solid 0.5px; border-radius: 100%;">
                        <b>@${post.author.username}<p>id: ${post.id}</p></b>
                    </div>
                    <div class="card-body">
                        <img src="${post.image}" class="w-100">
                        <h6 class="mt-1" style="color: gray;">
                            ${post.created_at}
                        </h6>
                        <h5>
                            ${post.title}
                        </h5>
                        <p>
                            ${post.body}
                        </p>
                        <hr>
                        <div>
                            <span id="commentButton"><span class="material-symbols-outlined">edit</span>(${post.comments_count}) Comments</span>
                            <!--<div id="tagsDiv">
                            <span class="tags">$//{tag.name}</span>
                            </div>
                            </div>
                        </div>
                    </div>-->
                `
            
                document.getElementById("posts").innerHTML+=cardPost
            // }
        }
    })
    .catch(error=>alert(error))
}

function loginClick(){

    var username=document.getElementById("username-in").value
    var password=document.getElementById("password-in").value
    const data=
    {
        username:username,
        password:password
    }

    fetch(`${api}/login`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(data)
    })
    .then(respons=>respons.json())
    .then((data)=>{
        localStorage.setItem("token",data.token)
        localStorage.setItem("user",JSON.stringify(data.user))

        // مشان ياخفي  المودل بعد التسجيل 
        const modal = document.getElementById("loginModal")
        const modalInst=bootstrap.Modal.getInstance(modal)
        modalInst.hide()//أو show مشان تشوفها 
        showAlert("success",'loggedin success (: ')
        setTimeout(()=>{location.reload()},3000)
    })
    .catch((error)=>{
        const massage=error
        showAlert("danger",massage)
    })
}

function showAlert(mode,massage){
    const alertPlaceholder = document.getElementById('success-alert')
    const appendAlert = (message, type) => 
    {
        const wrapper = document.createElement('div')
        // mode="success"
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('')
        alertPlaceholder.append(wrapper)
    }

    appendAlert(massage,mode)

    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance('#success-alert')
        alert.close()
    }, 2000);
}

function setupUI(){
    const loginBtn=document.getElementById("login-btn")
    const registerBtn=document.getElementById("register-btn")
    const logoutBtn=document.getElementById("logout-div")
    const addPostBtn=document.getElementById("addPostButton")
    const token =localStorage.getItem("token")

    if(token==null){
        loginBtn.style.visibility="visible"
        registerBtn.style.visibility="visible"
        logoutBtn.style.setProperty("display","none","important")
        addPostBtn.style.setProperty("display","none","important")

    }else{
        let name=JSON.parse(localStorage.getItem("user")).name
        let image=JSON.parse(localStorage.getItem("user")).profile_image
        logoutBtn.style.visibility="visible"
        loginBtn.style.visibility="hidden"
        registerBtn.style.visibility="hidden"
        document.getElementById("nameNav").innerHTML=name
        document.getElementById("ii").innerHTML+=`<img id="pimg" class="pimg" src="${image}">`
        
    }
}

function logout(){
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    let a=confirm("Are you sure you want to log out ? ")
    if (a) {
        showAlert('danger',"loggend out succeses")
        setTimeout(()=>{location.reload()},3000)

    }
}

function register() {
    const name = document.getElementById("name-in2").value;
    const username = document.getElementById("username-in2").value;
    const email = document.getElementById("email-in2").value;
    const password = document.getElementById("password-in2").value;
    const image = document.getElementById("image-in2").files[0];
    
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('image', image);
    formData.append('name', name);
    formData.append('email', email);

    fetch(`${api}/register`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then((data) => {
        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            console.log(data);

            // إخفاء المودال
            const modal = document.getElementById("registerModal");
            const modalInst = bootstrap.Modal.getInstance(modal);
            modalInst.hide();
            showAlert("success", 'New user registered successfully (:');
        } else {
            throw new Error('Invalid response from server');
        }
    })
    .catch(error => {
        console.error("Error:", error);
        showAlert('danger', 'Registration failed. Please try again.');
    });
}


function addPost() {
    const title = document.getElementById("title-in3").value;
    const body = document.getElementById("postBody-in3").value;
    const image = document.getElementById("image-in3").files[0];
    const token = localStorage.getItem("token");

    if (!token) {
        showAlert("danger", "You must be logged in to add a post.");
        return;
    }
    if (!title || !body || !image) {
        showAlert("danger", "Please fill in all fields.");
        return;
    }
    

    const formData = new FormData();
    formData.append("body", body);
    formData.append("title", title);
    formData.append("image", image);

    fetch(`${api}/posts`, {
        method: "POST",
        headers: {
            'authorization': `Bearer ${token}` // لا تضف Content-Type مع FormData
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return response.json();
    })
    .then((data) => {
        console.log(data);

        // إخفاء المودال بعد الإضافة
        const modal = document.getElementById("create-post-modal");
        const modalInst = bootstrap.Modal.getInstance(modal);
        modalInst.hide();
        showAlert("success", "Post has been added successfully.");
        
    })
    .catch((error) => {
        console.error("Error:", error);
        showAlert("danger", error.message || "Failed to add post. Please try again.");
    });
}

function postClick(postId){
    window.location= `postDitels.html?postId=${postId}`
    // alert(postId)

}










