/**
 * HTML5dialog
 * @author Etienne Gauvin <dev.etienne.gauvin@gmail.com>
 */

$(document).ready(function()
{
    // Tester la présence de l'API WebSocket
    window.WebSocket = ( window.WebSocket || window.MozWebSocket );
	if ( window.WebSocket )
	{
        // Activation des boutons
        $('#connect').removeAttr('hidden').removeAttr('disabled');
        $('#disconnect').attr('hidden', 'hidden').children('input').attr('disabled', 'disabled');
        $('#options').removeAttr('hidden').children('input').removeAttr('disabled');
        $('#communication').children('input').attr('disabled', 'disabled');
        
		output( 'Your browser support the API WebSocket.', 'validation flash' );
	}
	
	// Pas de bibliothèque
	else
		output( 'Your browser does not support the API WebSocket.', 'critical-error' );
    
});


/**
 * Connect to the server.
 * 
 */

$('#connection').submit(function()
{
    if ( typeof window.wsock === 'undefined' || window.wsock.readyState === window.WebSocket.CLOSED )
    {
        // Désactivation des boutons de connexion et d'envoi de messages
        $('#connect').attr('hidden', 'hidden').attr('disabled', 'disabled');
        $('#disconnect').removeAttr('hidden').removeAttr('disabled');
        $('#options').attr('hidden', 'hidden').children('input').attr('disabled', 'disabled');
        $('#communication').children('input').attr('disabled', 'disabled');
        
        // Connexion
        var location = 'ws' + ( $('#ssl').attr('checked') === 'checked' ? 's' : '' ) + '://' + $('#host').val();
		$('#server-location').text( location );
		output( '<img alt="Loading..." src="./img/loading.png" /> Connecting to <i>' + $('#host').val() + '</i> ...', 'flash information clear' );
        
        window.wsock = new window.WebSocket( location );
        
        if ( window.wsock )
        {
            window.wsock.onopen = wsOpen;
            window.wsock.onclose = wsClose;
            window.wsock.onmessage = wsMessage;
            window.wsock.onerror = wsError;
        }
        
        return false;
    }
	else
		output( 'Your are not disconnected.', 'error' );
    
    return false;
});


/**
 * Disconnect from the server.
 * 
 */

$('#disconnect').click(function()
{
    if ( typeof window.wsock !== 'undefined' && window.wsock.readyState !== window.WebSocket.CLOSED )
    {
        // Désactivation des boutons
        $('#disconnect').children('input').attr('disabled', 'disabled');
        $('#communication').children('input').attr('disabled', 'disabled');
        
        output( "<img alt='Loading...' src='./img/loading.png' /> Disconnecting...", 'flash information' );
        window.wsock.close();
    }
    else
        output( "You are not connected !", 'error flash' );
});

/**
 * Send a message.
 * 
 */

$('#communication').submit(function()
{
    if ( typeof window.wsock !== 'undefined' && window.wsock.readyState !== window.WebSocket.CLOSED )
    {
        var message = $.trim($('#message').val());
        if ( message )
        {
            // Désactivation de l'envoi de messages
            $('#communication').children('input').attr('disabled', 'disabled');
            
            // Envoi du message
            window.wsock.send( message );
            $('#message').val('').select();
            
            // Réactivation de l'envoi de messages
            $('#communication').children('input').removeAttr('disabled');
        }
    }
    else
        output( "You are not connected !", 'error flash' );
    return false;
});


/**
 * On open.
 * 
 */

function wsOpen( )
{
    // Activation des boutons d'envoi de messages et de déconnexion
    $('#connect').attr('hidden', 'hidden').attr('disabled', 'disabled');
    $('#disconnect').removeAttr('hidden').removeAttr('disabled');
    $('#options').attr('hidden', 'hidden').children('input').attr('disabled', 'disabled');
    $('#communication').children('input').removeAttr('disabled');
    
    output( "The connection is opened.", 'validation' );
}


/**
 * On close.
 * 
 * @param CloseEvent closeevent
 */

function wsClose( closeEvent )
{
    // Activation des boutons de connexion
    $('#connect').removeAttr('hidden').removeAttr('disabled');
    $('#disconnect').attr('hidden', 'hidden').attr('disabled', 'disabled');
    $('#options').removeAttr('hidden').children('input').removeAttr('disabled');
    $('#server-location').empty();
    $('#communication').children('input').attr('disabled', 'disabled');
    
    output( "The connection is closed [" + closeEvent.code + "].", 'information' );
}


/**
 * On error.
 * 
 * @param event
 */

function wsError( event )
{
    // Activation des boutons de connexion
    $('#connect').removeAttr('hidden').removeAttr('disabled');
    $('#disconnect').attr('hidden', 'hidden').attr('disabled', 'disabled');
    $('#options').removeAttr('hidden').children('input').removeAttr('disabled');
    $('#server-location').empty();
    $('#communication').children('input').attr('disabled', 'disabled');
    
    output( "An error has occurred.", 'critical-error' );
}


/**
 * On message.
 * 
 * @param Event event
 */

function wsMessage( event )
{
    if ( typeof event.data === 'string' && event.data[0] )
    {
        switch ( event.data[0] )
        {
            case '~':
                if ( event.data[1] === '!' )    output( event.data.substr( 2 ), 'flash error' );
                else                            output( event.data.substr( 1 ), 'flash' );
            break;
            
            case '!':
                output( event.data.substr( 1 ), 'error' );
            break;
            
            case 'i':
                output( event.data.substr( 1 ), 'information' );
            break;
            
            default:
            output( event.data );
        }
    }
}


/**
 * The last position of scroll.
 * 
 * @var int
 */

var lastScroll = 0;

/**
 * Output content.
 * 
 * @param object content
 * @param string classes = ''   Classes of the <li>. Class 'flash' => override next time
 */
 
 function output( content, classes )
 {
    // Supprimer le <li> précédent si il possède la classe 'flash'
    var last = $('#dialogues > #messagesList> ul > li').last();
    if (last.hasClass('flash')) last.remove();
    
    // Le nouveau <li>
    var $li = $('<li/>').addClass(classes?classes:'').html(content)
    
    // Supprimer tous les <li> si le nouveau possède la classe 'clear'
    if ($li.hasClass('clear')) $('#dialogues > #messagesList> ul').empty();
    
    // Ajout du nouveau <li>
    $('#dialogues > #messagesList > ul').append( $li );
    
    // Descendre à la position du nouveau message si le scroller est en bas.
    if ( $('#dialogues > #messagesList').scrollTop() == lastScroll )
        $('#dialogues > #messagesList').scrollTop( $('#dialogues > #messagesList > ul').height() - $('#dialogues > #messagesList').height() );
    
    // Repositionnement du scroller.
    lastScroll = $('#dialogues > #messagesList > ul').height() - $('#dialogues > #messagesList').height();
    lastScroll = lastScroll * ( lastScroll >= 0 );
 }