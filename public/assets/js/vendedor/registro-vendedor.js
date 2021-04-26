
    $('#form-cadastrar-loja').submit(() => {

        let nomeloja = $('#nomeloja').val()
        let Tipopessoa = $('#Tipopessoa').val()
        let rzsocial = $('#rzsocial').val()
        let cnpj = $('#cnpj').val()
        let nomecompleto = $('#nomecompleto').val()
        let cpf = $('#cpf').val()
        let telcomercial = $('#telcomercial').val()
        let celcomercial = $('#celcomercial').val()
        let email = $('#email').val()
        let cep = $('#cep').val()
        let logradouro = $('#logradouro').val()
        let numero = $('#numero').val()
        let bairro = $('#bairro').val()
        let localidade = $('#localidade').val()
        let uf = $('#uf').val()
        let idvendedor = $("#idvendedor").val()
        let validate = $("#validate").val()
        event.preventDefault()
        jQuery.ajax({
            type: "POST",
            url: '/usuarios/ativar-vendedor',
            data: {
                idvendedor: idvendedor, nomeloja: nomeloja, Tipopessoa: Tipopessoa, rzsocial: rzsocial, nomecompleto: nomecompleto, cnpj: cnpj, cpf: cpf, telcomercial: telcomercial,
                celcomercial: celcomercial, email: email, cep: cep, logradouro: logradouro, numero: numero, bairro: bairro, localidade: localidade, uf: uf,
                validate: validate
            },

            success: function (response) {

                if (response.responseid == 200) {
                    $(document).ready(() => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Loja ativada com sucesso!',
                            text: 'Você será direcionado para sua loja virtual, personalize-a a deixe com sua cara! :)',
                            confirmButtonText: 'Ok',
                            allowOutsideClick: false,
                        }).then((result) => {
                            if (result.isConfirmed) {
                               window.location.replace('/usuarios/perfil-vendedor/{{usuario._id}}')
                            }
                        })

                    })
                }
                if (response.responseid == 101) {
                    $(document).ready(() => {
                        Swal.fire({
                            toast: true,
                            title: '<i style="color:white">Informações inválidas!</i>',
                            position: 'bottom-right',
                            background: "#ff0000",
                            showConfirmButton: false,
                            showCloseButton: true,
                            timer: 5000,
                            timerProgressBar: true,
                        })
                    })
                }
            }
        })
    })


    //Consulta o CEP

    const cep = document.querySelector("#cep")

    const showData = (result) => {
        for (const campo in result) {
            if (document.querySelector("#" + campo)) {
                document.querySelector("#" + campo).value = result[campo]
            }
        }
    }

    cep.addEventListener("blur", (e) => {
        let search = cep.value.replace("-", "")
        const options = {
            method: 'GET',
            mode: 'cors',
            cache: 'default'
        }

        fetch(`https://viacep.com.br/ws/${search}/json/`, options)
            .then(response => {
                response.json()
                    .then(data => showData(data))
            })
            .catch(e => console.log('Deu Erro: ' + e, message))
    })



    //verifica CPF

    function is_cpf(c) {

        if ((c = c.replace(/[^\d]/g, "")).length != 11)
            return false

        if (c == "00000000000" || c == "11111111111" || c == "22222222222" || c == "33333333333" || c == "44444444444" || c == "55555555555" || c == "66666666666" || c == "77777777777" || c == "88888888888" || c == "99999999999")
            return false;

        var r;
        var s = 0;

        for (i = 1; i <= 9; i++)
            s = s + parseInt(c[i - 1]) * (11 - i);

        r = (s * 10) % 11;

        if ((r == 10) || (r == 11))
            r = 0;

        if (r != parseInt(c[9]))
            return false;

        s = 0;

        for (i = 1; i <= 10; i++)
            s = s + parseInt(c[i - 1]) * (12 - i);

        r = (s * 10) % 11;

        if ((r == 10) || (r == 11))
            r = 0;

        if (r != parseInt(c[10]))
            return false;

        return true;
    }


    function fMasc(objeto, mascara) {
        obj = objeto
        masc = mascara
        setTimeout("fMascEx()", 1)
    }

    function fMascEx() {
        obj.value = masc(obj.value)
    }

    function mCPF(cpf) {
        cpf = cpf.replace(/\D/g, "")
        cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2")
        cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2")
        cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2")
        return cpf
    }

    cpfCheck = function (el) {

        document.getElementById('cpfResponse').innerHTML = is_cpf(el.value) ? '<i style="color: green" class="fas fa-check">Valido</i>' : '<i style="color: red" class="fas fa-times">Inválido</i>';
        document.getElementById('validate').value = is_cpf(el.value)
    }

    function validarCNPJ(cnpj) {

        cnpj = cnpj.replace(/[^\d]+/g, '');

        if (cnpj == '') return false;

        if (cnpj.length != 14)
            return false;
        ;

        // Elimina CNPJs invalidos conhecidos
        if (cnpj == "00000000000000" ||
            cnpj == "11111111111111" ||
            cnpj == "22222222222222" ||
            cnpj == "33333333333333" ||
            cnpj == "44444444444444" ||
            cnpj == "55555555555555" ||
            cnpj == "66666666666666" ||
            cnpj == "77777777777777" ||
            cnpj == "88888888888888" ||
            cnpj == "99999999999999")
            return valuefalse;

        // Valida DVs
        tamanho = cnpj.length - 2
        numeros = cnpj.substring(0, tamanho);
        digitos = cnpj.substring(tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2)
                pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0))
            return false;

        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2)
                pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(1))
            return false;

        return true;

    }

    cnpjCheck = function (elcnpj) {

        document.getElementById('cnpjResponse').innerHTML = validarCNPJ(elcnpj.value) ? '<i style="color: green" class="fas fa-check">Valido</i>' : '<i style="color: red" class="fas fa-times">Inválido</i>';
        document.getElementById('validate').value = validarCNPJ(elcnpj.value)
    }
